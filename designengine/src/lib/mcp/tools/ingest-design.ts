import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import { openai } from '@/lib/openai/client';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function extractWithAI(html: string, url: string) {
  const truncatedHtml = html.slice(0, 30000);

  const prompt = `You are a design system engineer. Analyze this HTML/CSS from ${url} and extract the EXACT design tokens and component patterns.

HTML (truncated):
${truncatedHtml}

Return ONLY valid JSON matching this EXACT structure:
{
  "tokens": {
    "colors": {
      "primary": "#exact-hex", "secondary": "#hex", "accent": "#hex",
      "background": "#hex", "surface": "#hex",
      "text": { "primary": "#hex", "secondary": "#hex", "muted": "#hex" },
      "border": "#hex", "error": "#hex", "success": "#hex"
    },
    "typography": {
      "fontFamily": { "heading": "exact-font-name", "body": "exact-font-name", "mono": "monospace-font" },
      "scale": {
        "xs": "0.75rem/1.4", "sm": "0.875rem/1.5", "base": "1rem/1.6",
        "lg": "1.125rem/1.5", "xl": "1.25rem/1.4", "2xl": "1.5rem/1.3",
        "3xl": "1.875rem/1.2", "4xl": "2.25rem/1.15"
      }
    },
    "spacing": { "unit": "4px", "scale": [0,1,2,3,4,5,6,8,10,12,16,20,24] },
    "borders": {
      "radius": { "sm": "val", "md": "val", "lg": "val", "xl": "val", "full": "9999px" },
      "width": { "default": "1px", "thick": "2px" }
    },
    "shadows": { "sm": "val", "md": "val", "lg": "val", "xl": "val" },
    "effects": { "blur": "val", "opacity": {} }
  },
  "components": {
    "button": { "primary": { "classes": "tailwind classes", "css": "raw css" }, "secondary": { "classes": "", "css": "" }, "ghost": { "classes": "", "css": "" } },
    "card": { "default": { "classes": "", "css": "" } },
    "input": { "default": { "classes": "", "css": "" } },
    "nav": { "style": "description", "classes": "" },
    "heading": { "h1": { "classes": "", "css": "" }, "h2": { "classes": "", "css": "" }, "h3": { "classes": "", "css": "" } }
  }
}

CRITICAL RULES:
- Extract EXACT hex values from the CSS. If the site uses #1a1a2e, return #1a1a2e, NOT "dark blue"
- Extract EXACT font-family names as they appear in the CSS
- Extract EXACT spacing, border-radius, and shadow values
- For components, generate Tailwind classes that reproduce the exact styling
- If a value cannot be determined, use reasonable defaults`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

function buildCssVariables(tokens: Record<string, unknown>): string {
  const colors = (tokens.colors || {}) as Record<string, unknown>;
  const typography = (tokens.typography || {}) as Record<string, unknown>;
  const borders = (tokens.borders || {}) as Record<string, unknown>;
  const shadows = (tokens.shadows || {}) as Record<string, string>;
  const textColors = (colors.text || {}) as Record<string, string>;
  const fontFamily = (typography.fontFamily || {}) as Record<string, string>;
  const radius = ((borders.radius || {}) as Record<string, string>);

  const lines = [':root {'];

  for (const [k, v] of Object.entries(colors)) {
    if (typeof v === 'string') lines.push(`  --color-${k}: ${v};`);
  }
  if (textColors) {
    for (const [k, v] of Object.entries(textColors)) {
      lines.push(`  --color-text-${k}: ${v};`);
    }
  }
  for (const [k, v] of Object.entries(fontFamily)) {
    lines.push(`  --font-${k}: '${v}', system-ui, sans-serif;`);
  }
  for (const [k, v] of Object.entries(radius)) {
    lines.push(`  --radius-${k}: ${v};`);
  }
  for (const [k, v] of Object.entries(shadows)) {
    lines.push(`  --shadow-${k}: ${v};`);
  }

  lines.push('}');
  return lines.join('\n');
}

function buildTailwindConfig(tokens: Record<string, unknown>): Record<string, unknown> {
  const colors = (tokens.colors || {}) as Record<string, unknown>;
  const typography = (tokens.typography || {}) as Record<string, unknown>;
  const borders = (tokens.borders || {}) as Record<string, unknown>;
  const shadows = (tokens.shadows || {}) as Record<string, string>;
  const fontFamily = (typography.fontFamily || {}) as Record<string, string>;
  const radius = ((borders.radius || {}) as Record<string, string>);

  const flatColors: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors)) {
    if (typeof v === 'string') flatColors[k] = v;
    else if (typeof v === 'object' && v) {
      for (const [sk, sv] of Object.entries(v as Record<string, string>)) {
        flatColors[`${k}-${sk}`] = sv;
      }
    }
  }

  return {
    colors: flatColors,
    fontFamily: Object.fromEntries(
      Object.entries(fontFamily).map(([k, v]) => [k, [v, 'system-ui', 'sans-serif']])
    ),
    borderRadius: radius,
    boxShadow: shadows,
  };
}

export function registerIngestDesignTool(server: McpServer): void {
  server.tool(
    'ingest-design',
    'Scrape a URL, extract precise design tokens and component patterns using AI, save as a persistent design profile, and return implementation-ready code artifacts.',
    {
      url: z.string().url().describe('The URL of the website to analyze'),
      projectName: z.string().describe('Project name for this design profile (e.g. "my-saas-app")'),
      includeScreenshot: z.boolean().optional().default(true).describe('Capture a screenshot'),
    },
    async ({ url, projectName, includeScreenshot }) => {
      try {
        const ingestion = await ingestDesignFromUrl(url, {
          includeScreenshot,
          includeHtml: true,
          includeMarkdown: true,
        });

        if (!ingestion.success) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({ success: false, error: ingestion.error || 'Scrape failed', url }, null, 2),
            }],
          };
        }

        const htmlContent = ingestion.html || ingestion.markdown || '';
        const extracted = await extractWithAI(htmlContent, url);
        const tokens = extracted.tokens || {};
        const components = extracted.components || {};

        const cssVariables = buildCssVariables(tokens);
        const tailwindConfig = buildTailwindConfig(tokens);

        const { data: existing } = await supabaseAdmin
          .from('design_profiles')
          .select('id')
          .eq('project_name', projectName)
          .limit(1) as { data: Array<{ id: string }> | null; error: unknown };

        if (existing && existing.length > 0) {
          await supabaseAdmin
            .from('design_profiles')
            .update({
              source_url: url,
              tokens,
              components,
              tailwind_config: tailwindConfig,
              css_variables: cssVariables,
              raw_css: htmlContent.slice(0, 50000),
            })
            .eq('id', existing[0].id);
        } else {
          await supabaseAdmin
            .from('design_profiles')
            .insert({
              project_name: projectName,
              source_url: url,
              tokens,
              components,
              tailwind_config: tailwindConfig,
              css_variables: cssVariables,
              raw_css: htmlContent.slice(0, 50000),
            });
        }

        const tailwindConfigFile = `import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: ${JSON.stringify(tailwindConfig, null, 6)},
  },
  plugins: [],
};

export default config;`;

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              url,
              projectName,
              profileSaved: true,
              tokens,
              components,
              screenshot: ingestion.screenshot,
              codeArtifacts: {
                cssVariables,
                tailwindConfig,
                tailwindConfigFile,
              },
            }, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown ingestion error';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    }
  );
}
