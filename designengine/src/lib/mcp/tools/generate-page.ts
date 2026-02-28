import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { buildFullContextPrompt, loadDesignProfile, profileToContextPrompt } from './shared/load-profile';

const PAGE_TYPES = [
  'landing', 'pricing', 'about', 'contact', 'dashboard', 'settings',
  'profile', 'analytics', 'table_view', 'form', 'auth_login', 'auth_signup',
  'blog_list', 'blog_post', 'docs', '404', 'empty_state',
] as const;

export function registerGeneratePageTool(server: McpServer): void {
  server.tool(
    'generate-page',
    'Generate a complete, production-ready page component styled with the stored design profile. Imports from the component library and includes realistic sample data.',
    {
      projectName: z.string().describe('Project name — loads the design profile for styling'),
      pageType: z.enum(PAGE_TYPES).describe('Type of page to generate'),
      description: z.string().optional().describe('Additional context about what the page needs'),
      framework: z.enum(['react_tailwind', 'nextjs', 'html_css']).optional().default('nextjs').describe('Output framework'),
      includeSampleData: z.boolean().optional().default(true).describe('Include realistic sample/mock data'),
    },
    async ({ projectName, pageType, description, framework, includeSampleData }) => {
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

        const contextPrompt = await buildFullContextPrompt(profile, 'generating a complete page component');

        const frameworkInstructions: Record<string, string> = {
          react_tailwind: 'a React functional component with TypeScript and Tailwind CSS. Export as default.',
          nextjs: 'a Next.js App Router page component. Include proper metadata export, use server components where possible, and follow Next.js 14 conventions. The main file should be page.tsx. Also generate a loading.tsx skeleton.',
          html_css: 'a standalone HTML page with embedded CSS.',
        };

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a senior full-stack engineer building production pages.

${contextPrompt}

Generate ${frameworkInstructions[framework] || frameworkInstructions.nextjs}

REQUIREMENTS:
- Use ONLY the design tokens above — no generic Tailwind colors (no bg-blue-500, etc.)
- Import shared components (Button, Card, Input, Modal, Badge, Table, Avatar, Alert, Tabs) from "@/components/ui" — assume they exist and match the design system
- ${includeSampleData ? 'Include realistic sample data with proper TypeScript types' : 'Use placeholder comments for data, no hardcoded sample data'}
- Fully responsive (mobile-first)
- Include proper semantic HTML and accessibility
- For Next.js: include metadata, use async server components where appropriate
${description ? `- Additional requirements: ${description}` : ''}

Return ONLY valid JSON:
{
  "files": [
    { "filename": "page.tsx", "code": "complete file content" },
    { "filename": "loading.tsx", "code": "loading skeleton content" }
  ],
  "dependencies": ["any npm packages needed beyond the standard stack"],
  "notes": "Brief implementation notes for the AI agent"
}`,
            },
            {
              role: 'user',
              content: `Generate a "${pageType}" page for project "${profile.project_name}".${description ? ` Context: ${description}` : ''}`,
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
              pageType,
              files: result.files || [],
              dependencies: result.dependencies || [],
              notes: result.notes || '',
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
