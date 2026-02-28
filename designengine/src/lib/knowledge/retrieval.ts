import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/openai/embeddings';

export interface KnowledgeChunkResult {
  id: string;
  sourceName: string;
  sectionTitle: string | null;
  chunkText: string;
  similarity: number;
}

export async function searchKnowledge(
  userId: string,
  query: string,
  limit = 8,
  threshold = 0.45
): Promise<KnowledgeChunkResult[]> {
  const embedding = await generateEmbedding(query);

  const { data, error } = await supabaseAdmin.rpc('match_knowledge_chunks', {
    p_user_id: userId,
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

  return `\n=== DESIGN KNOWLEDGE FROM USER'S LIBRARY ===\nThe following design principles come from the user's uploaded reference materials. Apply them when generating code.\n\n${formatted.join('\n\n')}\n=== END KNOWLEDGE ===\n`;
}

export async function getKnowledgeContext(
  userId: string | undefined,
  query: string
): Promise<string> {
  if (!userId) return '';

  const hasChunks = await supabaseAdmin
    .from('knowledge_chunks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .limit(1);

  if (!hasChunks.count || hasChunks.count === 0) return '';

  const chunks = await searchKnowledge(userId, query, 6, 0.45);
  return formatKnowledgeContext(chunks);
}

export async function listKnowledgeSources(userId: string): Promise<
  Array<{ sourceName: string; sourceType: string; chunkCount: number; createdAt: string }>
> {
  const { data, error } = await supabaseAdmin
    .from('knowledge_chunks')
    .select('source_name, source_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const sourceMap = new Map<string, { sourceType: string; count: number; createdAt: string }>();
  for (const row of data as Array<{ source_name: string; source_type: string; created_at: string }>) {
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
