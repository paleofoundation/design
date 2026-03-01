import { supabaseAdmin } from '@/lib/supabase/admin';
import { DESIGN_KNOWLEDGE_PROMPT } from './design-knowledge';
import { getKnowledgeContext } from '@/lib/knowledge/retrieval';

export interface DesignProfile {
  id: string;
  user_id: string | null;
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
    .select('id, user_id, project_name, source_url, tokens, components, tailwind_config, css_variables')
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

function buildVariableReference(cssVariables: string): string {
  const lines = cssVariables.split('\n').filter(l => l.includes(':'));
  if (lines.length === 0) return '';

  const mappings = lines.map(line => {
    const match = line.match(/(--[\w-]+)\s*:\s*(.+?)\s*;/);
    if (!match) return null;
    return `  ${match[1]}: ${match[2]}`;
  }).filter(Boolean);

  if (mappings.length === 0) return '';
  return `\nCSS VARIABLE QUICK REFERENCE (use these exact variable names in var()):\n${mappings.join('\n')}`;
}

export function profileToContextPrompt(profile: DesignProfile): string {
  const tokens = profile.tokens;

  const variableRef = profile.css_variables
    ? buildVariableReference(profile.css_variables)
    : '';

  const profileContext = `DESIGN SYSTEM CONTEXT (project: "${profile.project_name}"):
You MUST use these exact design tokens in all generated code. Do NOT deviate.
NEVER use hardcoded hex values — always use var(--variable-name) from the reference below.

Colors: ${JSON.stringify(tokens.colors || {})}
Typography: ${JSON.stringify(tokens.typography || {})}
Spacing: ${JSON.stringify(tokens.spacing || {})}
Borders: ${JSON.stringify(tokens.borders || {})}
Shadows: ${JSON.stringify(tokens.shadows || {})}
${tokens.mood ? `Mood: ${tokens.mood}` : ''}
${tokens.artStyle ? `Art Style: ${tokens.artStyle} — use this preset for all illustrations and visual assets` : ''}
${profile.components ? `Component Patterns: ${JSON.stringify(profile.components)}` : ''}
${profile.css_variables ? `CSS Variables:\n${profile.css_variables}` : ''}
${variableRef}

All colors, spacing, border-radius, shadows, and fonts in your output MUST use the CSS custom properties listed above. Zero hardcoded hex values allowed.`;

  return `${DESIGN_KNOWLEDGE_PROMPT}\n\n${profileContext}`;
}

export async function buildFullContextPrompt(
  profile: DesignProfile,
  contextHint?: string
): Promise<string> {
  const basePrompt = profileToContextPrompt(profile);

  const knowledgeContext = await getKnowledgeContext(
    profile.user_id ?? undefined,
    contextHint || `design system for ${profile.project_name}`
  );

  if (!knowledgeContext) return basePrompt;
  return `${basePrompt}\n\n${knowledgeContext}`;
}
