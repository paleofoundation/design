import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parseAndChunk } from '@/lib/knowledge/chunker';
import { generateEmbedding } from '@/lib/openai/embeddings';

export const maxDuration = 120;

const ALLOWED_TYPES: Record<string, 'pdf' | 'txt' | 'md' | 'epub'> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/epub+zip': 'epub',
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const sourceName = (formData.get('sourceName') as string) || file?.name || 'Untitled';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const mimeType = file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  let fileType = ALLOWED_TYPES[mimeType];

  if (!fileType && ext) {
    if (ext === 'pdf') fileType = 'pdf';
    else if (ext === 'md') fileType = 'md';
    else if (ext === 'txt') fileType = 'txt';
    else if (ext === 'epub') fileType = 'epub';
  }

  if (!fileType) {
    return NextResponse.json(
      { error: `Unsupported file type: ${mimeType || ext}. Accepted: .pdf, .txt, .md` },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const chunks = await parseAndChunk(buffer, fileType);

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No content could be extracted from the file' }, { status: 400 });
    }

    await supabaseAdmin
      .from('knowledge_chunks')
      .delete()
      .eq('user_id', user.id)
      .eq('source_name', sourceName);

    const BATCH_SIZE = 20;
    let inserted = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      const embeddings = await Promise.all(
        batch.map((c) => generateEmbedding(c.text.substring(0, 2000)))
      );

      const rows = batch.map((chunk, idx) => ({
        user_id: user.id,
        source_name: sourceName,
        source_type: fileType,
        section_title: chunk.sectionTitle,
        chunk_text: chunk.text,
        chunk_index: chunk.index,
        token_count: chunk.tokenCount,
        embedding: embeddings[idx],
      }));

      const { error } = await supabaseAdmin
        .from('knowledge_chunks')
        .insert(rows);

      if (error) {
        console.error(`Batch insert error at offset ${i}:`, error.message);
      } else {
        inserted += batch.length;
      }

      if (i + BATCH_SIZE < chunks.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    return NextResponse.json({
      success: true,
      sourceName,
      fileType,
      totalChunks: chunks.length,
      insertedChunks: inserted,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
