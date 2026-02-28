import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { loadDesignProfile, profileToContextPrompt } from './shared/load-profile';

const ALL_COMPONENTS = [
  'Button', 'Card', 'Input', 'Select', 'Textarea', 'Modal', 'Badge',
  'Table', 'Avatar', 'Alert', 'Tabs', 'Dropdown', 'Tooltip',
  'Breadcrumb', 'Pagination',
];

async function generateComponents(
  profile: NonNullable<Awaited<ReturnType<typeof loadDesignProfile>>>,
  framework: string,
  components: string[],
) {
  const contextPrompt = profileToContextPrompt(profile);
  const componentList = components.join(', ');

  const frameworkInstructions: Record<string, string> = {
    react_tailwind: 'React functional components with TypeScript and Tailwind CSS classes. Export each component as a named export.',
    react_css: 'React functional components with TypeScript and CSS modules. Include a separate .module.css file for each component.',
    html_css: 'Plain HTML with embedded CSS. Each component is a reusable HTML snippet with a <style> block.',
    vue_tailwind: 'Vue 3 SFC components with TypeScript <script setup> and Tailwind CSS classes.',
  };

  const ext: Record<string, string> = {
    react_tailwind: '.tsx',
    react_css: '.tsx',
    html_css: '.html',
    vue_tailwind: '.vue',
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a senior UI engineer building a design-system component library.

${contextPrompt}

Generate ${frameworkInstructions[framework] || frameworkInstructions.react_tailwind}

For EACH component, include:
- Full TypeScript props interface (or equivalent)
- All standard variants (Button: primary, secondary, ghost, danger; Alert: info, success, warning, error; Badge: default, outline; etc.)
- Proper accessibility attributes (aria-*, role, keyboard handling)
- Responsive behavior where appropriate
- Use ONLY the design tokens above for colors, fonts, spacing, border-radius, and shadows

Return ONLY valid JSON:
{
  "components": [
    { "name": "ComponentName", "filename": "ComponentName${ext[framework] || '.tsx'}", "code": "complete file content" }
  ],
  "indexFile": "barrel export file content",
  "tailwindConfig": "tailwind.config.ts theme.extend additions needed for these components",
  "cssVariables": "CSS custom properties to add to globals.css"
}

Generate these components: ${componentList}`,
      },
      {
        role: 'user',
        content: `Generate the complete component library for project "${profile.project_name}" using the ${framework} framework. Components: ${componentList}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 16000,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  if (!raw) throw new Error('OpenAI returned empty response');
  return JSON.parse(raw);
}

export function registerGenerateComponentLibraryTool(server: McpServer): void {
  server.tool(
    'generate-component-library',
    'Generate a complete set of styled base components (Button, Card, Input, Modal, etc.) using the stored design profile tokens. Each component includes TypeScript types and all standard variants.',
    {
      projectName: z.string().describe('Project name — loads the design profile for styling'),
      framework: z.enum(['react_tailwind', 'react_css', 'html_css', 'vue_tailwind']).optional().default('react_tailwind').describe('Output framework'),
      components: z.array(z.string()).optional().describe('Specific components to generate. Omit to generate all.'),
    },
    async ({ projectName, framework, components }) => {
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

        const targetComponents = components?.length ? components : ALL_COMPONENTS;
        const result = await generateComponents(profile, framework, targetComponents);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              projectName: profile.project_name,
              framework,
              components: result.components || [],
              indexFile: result.indexFile || '',
              tailwindConfig: result.tailwindConfig || '',
              cssVariables: result.cssVariables || '',
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
