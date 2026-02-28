import { supabaseAdmin } from '@/lib/supabase/admin';
import { DESIGN_KNOWLEDGE_PROMPT } from './design-knowledge';

export interface DesignProfile {
  id: string;
  project_name: string;
  source_url: string | null;
  tokens: Record<string, unknown>;
  components: Record<string, unknown> | null;
  tailwind_config: Record<string, unknown> | null;
  css_variables: string | null;
}

export async function loadDesignProfile(
  projectName?: string
): Promise<DesignProfile | null> {
  let query = supabaseAdmin
    .from('design_profiles')
    .select('id, project_name, source_url, tokens, components, tailwind_config, css_variables')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (projectName) {
    query = query.eq('project_name', projectName);
  }

  const { data } = await query as {
    data: DesignProfile[] | null;
    error: unknown;
  };

  return data?.[0] ?? null;
}

export function profileToContextPrompt(profile: DesignProfile): string {
  const tokens = profile.tokens;
  const profileContext = `DESIGN SYSTEM CONTEXT (project: "${profile.project_name}"):
You MUST use these exact design tokens in all generated code. Do NOT deviate.

Colors: ${JSON.stringify(tokens.colors || {})}
Typography: ${JSON.stringify(tokens.typography || {})}
Spacing: ${JSON.stringify(tokens.spacing || {})}
Borders: ${JSON.stringify(tokens.borders || {})}
Shadows: ${JSON.stringify(tokens.shadows || {})}
${profile.components ? `Component Patterns: ${JSON.stringify(profile.components)}` : ''}
${profile.css_variables ? `CSS Variables:\n${profile.css_variables}` : ''}

All colors, spacing, border-radius, shadows, and fonts in your output MUST match these tokens exactly.`;

  return `${DESIGN_KNOWLEDGE_PROMPT}\n\n${profileContext}`;
}
