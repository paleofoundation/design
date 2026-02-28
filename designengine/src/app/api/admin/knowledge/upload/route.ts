import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parseAndChunk } from '@/lib/knowledge/chunker';
import { generateEmbedding } from '@/lib/openai/embeddings';

export const maxDuration = 120;

const ALLOWED_MIME: Record<string, 'pdf' | 'txt' | 'md' | 'epub'> = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/markdown': 'md',
  'application/epub+zip': 'epub',
};

const EXT_MAP: Record<string, 'pdf' | 'txt' | 'md' | 'epub'> = {
  pdf: 'pdf', txt: 'txt', md: 'md', epub: 'epub',
};

function resolveFileType(mime?: string, ext?: string): 'pdf' | 'txt' | 'md' | 'epub' | null {
  if (mime && ALLOWED_MIME[mime]) return ALLOWED_MIME[mime];
  if (ext && EXT_MAP[ext.toLowerCase()]) return EXT_MAP[ext.toLowerCase()];
  return null;
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  let buffer: Buffer;
  let sourceName: string;
  let fileType: 'pdf' | 'txt' | 'md' | 'epub' | null;
  let storagePath: string | null = null;

  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await req.json();
    storagePath = body.storagePath;
    sourceName = body.sourceName || 'Untitled';
    fileType = resolveFileType(undefined, body.fileExtension || storagePath?.split('.').pop());

    if (!storagePath) {
      return NextResponse.json({ error: 'storagePath is required' }, { status: 400 });
    }

    const { data: fileData, error: dlErr } = await supabaseAdmin
      .storage
      .from('knowledge-uploads')
      .download(storagePath);

    if (dlErr || !fileData) {
      return NextResponse.json(
        { error: `Failed to download from storage: ${dlErr?.message || 'Not found'}` },
        { status: 500 }
      );
    }

    buffer = Buffer.from(await fileData.arrayBuffer());
  } else {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    sourceName = (formData.get('sourceName') as string) || file?.name || 'Untitled';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop();
    fileType = resolveFileType(file.type, ext);
    buffer = Buffer.from(await file.arrayBuffer());
  }

  if (!fileType) {
    return NextResponse.json(
      { error: 'Unsupported file type. Accepted: .pdf, .txt, .md' },
      { status: 400 }
    );
  }

  try {
    const chunks = await parseAndChunk(buffer, fileType);

    if (chunks.length === 0) {
      if (storagePath) await supabaseAdmin.storage.from('knowledge-uploads').remove([storagePath]).catch(() => {});
      return NextResponse.json({ error: 'No content could be extracted from the file' }, { status: 400 });
    }

    await supabaseAdmin
      .from('knowledge_chunks')
      .delete()
      .eq('is_global', true)
      .eq('source_name', sourceName);

    const BATCH_SIZE = 20;
    let inserted = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      const embeddings = await Promise.all(
        batch.map((c) => generateEmbedding(c.text.substring(0, 2000)))
      );

      const rows = batch.map((chunk, idx) => ({
        user_id: admin.id,
        source_name: sourceName,
        source_type: fileType,
        section_title: chunk.sectionTitle,
        chunk_text: chunk.text,
        chunk_index: chunk.index,
        token_count: chunk.tokenCount,
        embedding: embeddings[idx],
        is_global: true,
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

    if (storagePath) await supabaseAdmin.storage.from('knowledge-uploads').remove([storagePath]).catch(() => {});

    return NextResponse.json({
      success: true,
      sourceName,
      fileType,
      totalChunks: chunks.length,
      insertedChunks: inserted,
      isGlobal: true,
    });
  } catch (err) {
    if (storagePath) await supabaseAdmin.storage.from('knowledge-uploads').remove([storagePath]).catch(() => {});
    const message = err instanceof Error ? err.message : 'Processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
