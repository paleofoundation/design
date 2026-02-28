import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/openai/embeddings';

export interface KnowledgeChunkResult {
  id: string;
  sourceName: string;
  sectionTitle: string | null;
  chunkText: string;
  similarity: number;
}

/**
 * Search knowledge chunks. The SQL function returns both global (is_global=true)
 * and user-specific chunks for the given userId. If userId is omitted, a
 * sentinel UUID is passed so only global chunks match.
 */
export async function searchKnowledge(
  userId: string | undefined,
  query: string,
  limit = 8,
  threshold = 0.45
): Promise<KnowledgeChunkResult[]> {
  const embedding = await generateEmbedding(query);

  const effectiveUserId = userId || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabaseAdmin.rpc('match_knowledge_chunks', {
    p_user_id: effectiveUserId,
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    console.error('Knowledge search failed:', error.message);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    sourceName: row.source_name as string,
    sectionTitle: row.section_title as string | null,
    chunkText: row.chunk_text as string,
    similarity: Math.round((row.similarity as number) * 1000) / 1000,
  }));
}

export function formatKnowledgeContext(chunks: KnowledgeChunkResult[]): string {
  if (chunks.length === 0) return '';

  const formatted = chunks.map((c, i) => {
    const source = c.sectionTitle
      ? `[${c.sourceName} — ${c.sectionTitle}]`
      : `[${c.sourceName}]`;
    return `${i + 1}. ${source}\n${c.chunkText}`;
  });

  return `\n=== DESIGN KNOWLEDGE LIBRARY ===\nThe following design principles come from curated reference materials. Apply them when generating code.\n\n${formatted.join('\n\n')}\n=== END KNOWLEDGE ===\n`;
}

/**
 * Get knowledge context for an AI prompt. Works with or without a userId:
 * - With userId: returns global + user-specific chunks
 * - Without userId: returns global chunks only
 */
export async function getKnowledgeContext(
  userId: string | undefined,
  query: string
): Promise<string> {
  const hasGlobal = await supabaseAdmin
    .from('knowledge_chunks')
    .select('id', { count: 'exact', head: true })
    .eq('is_global', true)
    .limit(1);

  let hasUserChunks = false;
  if (userId) {
    const userCheck = await supabaseAdmin
      .from('knowledge_chunks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_global', false)
      .limit(1);
    hasUserChunks = (userCheck.count ?? 0) > 0;
  }

  if ((!hasGlobal.count || hasGlobal.count === 0) && !hasUserChunks) return '';

  const chunks = await searchKnowledge(userId, query, 6, 0.45);
  return formatKnowledgeContext(chunks);
}

/** List sources uploaded by a specific user (non-global) */
export async function listKnowledgeSources(userId: string): Promise<
  Array<{ sourceName: string; sourceType: string; chunkCount: number; createdAt: string }>
> {
  const { data, error } = await supabaseAdmin
    .from('knowledge_chunks')
    .select('source_name, source_type, created_at')
    .eq('user_id', userId)
    .eq('is_global', false)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return aggregateSources(data as Array<{ source_name: string; source_type: string; created_at: string }>);
}

/** List global knowledge sources (admin-curated library) */
export async function listGlobalSources(): Promise<
  Array<{ sourceName: string; sourceType: string; chunkCount: number; createdAt: string }>
> {
  const { data, error } = await supabaseAdmin
    .from('knowledge_chunks')
    .select('source_name, source_type, created_at')
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return aggregateSources(data as Array<{ source_name: string; source_type: string; created_at: string }>);
}

/** Delete a global knowledge source */
export async function deleteGlobalSource(sourceName: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('knowledge_chunks')
    .delete({ count: 'exact' })
    .eq('is_global', true)
    .eq('source_name', sourceName);

  if (error) {
    throw new Error(`Failed to delete global source: ${error.message}`);
  }

  return count ?? 0;
}

export async function deleteKnowledgeSource(userId: string, sourceName: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('knowledge_chunks')
    .delete({ count: 'exact' })
    .eq('user_id', userId)
    .eq('source_name', sourceName);

  if (error) {
    throw new Error(`Failed to delete source: ${error.message}`);
  }

  return count ?? 0;
}

function aggregateSources(
  data: Array<{ source_name: string; source_type: string; created_at: string }>
): Array<{ sourceName: string; sourceType: string; chunkCount: number; createdAt: string }> {
  const sourceMap = new Map<string, { sourceType: string; count: number; createdAt: string }>();
  for (const row of data) {
    const existing = sourceMap.get(row.source_name);
    if (existing) {
      existing.count++;
    } else {
      sourceMap.set(row.source_name, {
        sourceType: row.source_type,
        count: 1,
        createdAt: row.created_at,
      });
    }
  }

  return Array.from(sourceMap.entries()).map(([name, info]) => ({
    sourceName: name,
    sourceType: info.sourceType,
    chunkCount: info.count,
    createdAt: info.createdAt,
  }));
}
