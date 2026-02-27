import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from './api-key';

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key' },
      { status: 401 }
    );
  }

  const validation = await validateApiKey(apiKey);

  if (!validation.valid || !validation.userId) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 403 }
    );
  }

  return handler(request, validation.userId);
}
