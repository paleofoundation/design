import { NextRequest, NextResponse } from 'next/server';
import { generateApiKey } from '@/lib/auth/api-key';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, name } = body;

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  const { key, hash, prefix } = generateApiKey();

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      user_id: userId,
      key_hash: hash,
      key_prefix: prefix,
      name: name || 'Default',
    })
    .select('id, key_prefix, name, created_at')
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: data.id,
    key,
    prefix: data.key_prefix,
    name: data.name,
    createdAt: data.created_at,
    message:
      'Save this key — it will not be shown again.',
  });
}
