import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { openai } from '@/lib/openai/client';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import { loadDesignProfile, profileToContextPrompt } from './shared/load-profile';

export function registerGenerateResponsiveRulesTool(server: McpServer): void {
  server.tool(
    'generate-responsive-rules',
    'Generate a comprehensive responsive ruleset for a project: breakpoints, per-element behavior at each screen size, typography scaling, spacing scaling, and Tailwind screen config.',
    {
      projectName: z.string().describe('Project name — loads the design profile'),
      url: z.string().url().optional().describe('Optional URL to analyze for existing responsive behavior'),
    },
    async ({ projectName, url }) => {
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

        const contextPrompt = profileToContextPrompt(profile);

        let siteContext = '';
        if (url) {
          const ingestion = await ingestDesignFromUrl(url, { includeHtml: true, includeMarkdown: true });
          if (ingestion.success) {
            siteContext = `\nExisting site HTML to analyze for responsive patterns:\n${(ingestion.html || ingestion.markdown || '').slice(0, 20000)}`;
          }
        }

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a responsive design architect.

${contextPrompt}
${siteContext}

Generate a comprehensive responsive design ruleset for this project. Define how every common UI element should adapt across breakpoints.

Return ONLY valid JSON:
{
  "breakpoints": {
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px"
  },
  "rules": [
    {
      "element": "navigation",
      "desktop": "Horizontal nav with all links visible",
      "tablet": "Hamburger menu with slide-out drawer",
      "mobile": "Bottom nav bar with 4 key items",
      "classes": {
        "desktop": "lg:flex lg:items-center lg:gap-8",
        "tablet": "md:hidden",
        "mobile": "fixed bottom-0 inset-x-0 flex justify-around py-2"
      }
    },
    {
      "element": "grid",
      "desktop": "3 columns",
      "tablet": "2 columns",
      "mobile": "1 column stacked",
      "classes": {
        "desktop": "lg:grid-cols-3",
        "tablet": "md:grid-cols-2",
        "mobile": "grid-cols-1"
      }
    },
    {
      "element": "sidebar",
      "desktop": "Fixed 280px sidebar",
      "tablet": "Collapsible overlay sidebar",
      "mobile": "Hidden, accessible via hamburger",
      "classes": {
        "desktop": "lg:w-[280px] lg:block",
        "tablet": "md:absolute md:z-50",
        "mobile": "hidden"
      }
    },
    ... more elements: hero, cards, tables, modals, forms, images, typography, footer
  ],
  "typographyScale": {
    "h1": { "desktop": "text-5xl", "tablet": "text-4xl", "mobile": "text-3xl" },
    "h2": { "desktop": "text-4xl", "tablet": "text-3xl", "mobile": "text-2xl" },
    "h3": { "desktop": "text-3xl", "tablet": "text-2xl", "mobile": "text-xl" },
    "body": { "desktop": "text-base", "tablet": "text-base", "mobile": "text-sm" },
    "small": { "desktop": "text-sm", "tablet": "text-sm", "mobile": "text-xs" }
  },
  "spacingScale": {
    "sectionPadding": { "desktop": "py-24 px-8", "tablet": "py-16 px-6", "mobile": "py-12 px-4" },
    "cardGap": { "desktop": "gap-8", "tablet": "gap-6", "mobile": "gap-4" },
    "containerMaxWidth": { "desktop": "max-w-7xl", "tablet": "max-w-3xl", "mobile": "max-w-full px-4" }
  },
  "tailwindScreenConfig": "complete screens config for tailwind.config.ts"
}

Include at least 8-10 element rules covering: navigation, grid, sidebar, hero, cards, tables, modals, forms, images, footer.`,
            },
            {
              role: 'user',
              content: `Generate responsive rules for "${profile.project_name}".${url ? ` Analyze existing responsive behavior at ${url}.` : ''}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 12000,
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
              breakpoints: result.breakpoints || {},
              rules: result.rules || [],
              typographyScale: result.typographyScale || {},
              spacingScale: result.spacingScale || {},
              tailwindScreenConfig: result.tailwindScreenConfig || '',
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
