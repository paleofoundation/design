import { openai } from './client';

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
      dimensions: 1536,
    });
    allEmbeddings.push(
      ...response.data.map(d => d.embedding)
    );
  }

  return allEmbeddings;
}

export function buildSearchText(pattern: {
  name: string;
  description: string;
  category: string;
  tags: string[];
  tokens?: Record<string, unknown>;
}): string {
  const parts = [
    pattern.name,
    pattern.description,
    `Category: ${pattern.category}`,
    `Tags: ${pattern.tags.join(', ')}`,
  ];

  const tokens = pattern.tokens as Record<string, any> | undefined;

  if (tokens?.colors) {
    parts.push(
      `Color scheme: ${tokens.colorScheme || 'light'}`
    );
    parts.push(
      `Primary color: ${tokens.colors.primary}`
    );
  }

  if (tokens?.typography?.fontFamilies) {
    parts.push(
      `Fonts: ${tokens.typography.fontFamilies.primary}, ${tokens.typography.fontFamilies.heading}`
    );
  }

  return parts.join('. ');
}
