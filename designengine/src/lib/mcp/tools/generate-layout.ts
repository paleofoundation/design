import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { loadDesignProfile, buildFullContextPrompt } from './shared/load-profile';

const LAYOUT_TYPES = [
  'dashboard_sidebar', 'dashboard_topnav', 'marketing', 'docs_sidebar',
  'blog', 'minimal', 'split_panel',
] as const;

const FEATURES = [
  'search', 'user_menu', 'notifications', 'breadcrumbs', 'footer', 'mobile_drawer',
] as const;

export function registerGenerateLayoutTool(server: McpServer): void {
  server.tool(
    'generate-layout',
    'Generate a structural layout shell (nav, sidebar, content area, footer) styled with design tokens. Includes responsive collapse behavior and works as a Next.js layout.tsx.',
    {
      projectName: z.string().describe('Project name — loads the design profile for styling'),
      layoutType: z.enum(LAYOUT_TYPES).describe('Type of layout to generate'),
      features: z.array(z.enum(FEATURES)).optional().describe('Optional features to include'),
      framework: z.enum(['react_tailwind', 'nextjs', 'html_css']).optional().default('nextjs').describe('Output framework'),
    },
    async ({ projectName, layoutType, features, framework }) => {
      try {
        const profile = await loadDesignProfile(projectName);
        if (!profile) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                error: 'No design profile found. Run ingest-design first.',
                hint: 'Example: ingest-design({ url: "https://your-site.com", projectName: "my-project" })',
              }, null, 2),
            }],
          };
        }

        const contextPrompt = await buildFullContextPrompt(profile, 'generating page layout structure');
        const featureList = features?.length ? features.join(', ') : 'none specified';

        const frameworkInstructions: Record<string, string> = {
          react_tailwind: 'React functional components with TypeScript and Tailwind CSS.',
          nextjs: 'Next.js App Router layout.tsx with TypeScript and Tailwind CSS. The main file must be layout.tsx that accepts {children}. Use server components where possible. Include "use client" only on interactive pieces.',
          html_css: 'Standalone HTML with embedded CSS. Use semantic HTML5 elements.',
        };

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a senior frontend architect building layout systems.

${contextPrompt}

Generate a "${layoutType}" layout using ${frameworkInstructions[framework] || frameworkInstructions.nextjs}

Features to include: ${featureList}

REQUIREMENTS:
- Use ONLY the design tokens above for all colors, fonts, spacing, border-radius, shadows
- Responsive: sidebar collapses to mobile drawer on small screens, topnav adapts
- Include a {children} placeholder for page content
- Include proper accessibility (nav landmarks, skip links, aria-expanded for mobile menu)
- Split into logical files (layout, sidebar, topbar, mobile drawer, etc.)
- Each file must be complete and self-contained

Return ONLY valid JSON:
{
  "files": [
    { "filename": "layout.tsx", "code": "complete file" },
    { "filename": "Sidebar.tsx", "code": "complete file" },
    { "filename": "Topbar.tsx", "code": "complete file" },
    { "filename": "MobileDrawer.tsx", "code": "complete file" }
  ],
  "usage": "Example of how to use this layout in a page component"
}

Only include files relevant to the layout type. A marketing layout might not need Sidebar.tsx.`,
            },
            {
              role: 'user',
              content: `Generate a "${layoutType}" layout for "${profile.project_name}" with features: ${featureList}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 16000,
          response_format: { type: 'json_object' },
        });

        const raw = response.choices[0].message.content;
        if (!raw) throw new Error('OpenAI returned empty response');
        const result = JSON.parse(raw);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              projectName: profile.project_name,
              layoutType,
              files: result.files || [],
              usage: result.usage || '',
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    }
  );
}
