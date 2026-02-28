import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listKnowledgeSources, deleteKnowledgeSource } from '@/lib/knowledge/retrieval';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sources = await listKnowledgeSources(user.id);
  return NextResponse.json({ sources });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sourceName } = await req.json();
  if (!sourceName) {
    return NextResponse.json({ error: 'sourceName is required' }, { status: 400 });
  }

  try {
    const deleted = await deleteKnowledgeSource(user.id, sourceName);
    return NextResponse.json({ deleted, sourceName });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
