import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { listGlobalSources, deleteGlobalSource } from '@/lib/knowledge/retrieval';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  const sources = await listGlobalSources();
  return NextResponse.json({ sources });
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  const { sourceName } = await req.json();
  if (!sourceName) {
    return NextResponse.json({ error: 'sourceName is required' }, { status: 400 });
  }

  try {
    const deleted = await deleteGlobalSource(sourceName);
    return NextResponse.json({ deleted, sourceName });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
