import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parseAndChunk } from '@/lib/knowledge/chunker';
import { generateEmbedding } from '@/lib/openai/embeddings';

export const maxDuration = 120;

const EXT_TO_TYPE: Record<string, 'pdf' | 'txt' | 'md' | 'epub'> = {
  pdf: 'pdf',
  txt: 'txt',
  md: 'md',
  epub: 'epub',
};

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const { storagePath, sourceName, fileExtension } = body as {
    storagePath: string;
    sourceName: string;
    fileExtension: string;
  };

  if (!storagePath || !sourceName) {
    return NextResponse.json({ error: 'storagePath and sourceName are required' }, { status: 400 });
  }

  const fileType = EXT_TO_TYPE[fileExtension?.toLowerCase()] || EXT_TO_TYPE[storagePath.split('.').pop()?.toLowerCase() || ''];
  if (!fileType) {
    return NextResponse.json({ error: `Unsupported file type: ${fileExtension}. Accepted: pdf, txt, md` }, { status: 400 });
  }

  try {
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('knowledge-uploads')
      .download(storagePath);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: `Failed to download file from storage: ${downloadError?.message || 'File not found'}` },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const chunks = await parseAndChunk(buffer, fileType);

    if (chunks.length === 0) {
      await supabaseAdmin.storage.from('knowledge-uploads').remove([storagePath]);
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

    // Clean up the storage file after successful processing
    await supabaseAdmin.storage.from('knowledge-uploads').remove([storagePath]);

    return NextResponse.json({
      success: true,
      sourceName,
      fileType,
      totalChunks: chunks.length,
      insertedChunks: inserted,
      isGlobal: true,
    });
  } catch (err) {
    // Clean up on error too
    await supabaseAdmin.storage.from('knowledge-uploads').remove([storagePath]).catch(() => {});
    const message = err instanceof Error ? err.message : 'Processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
