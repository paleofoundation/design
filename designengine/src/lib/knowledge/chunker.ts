import { PDFParse } from 'pdf-parse';

export interface TextChunk {
  text: string;
  index: number;
  sectionTitle: string | null;
  tokenCount: number;
}

const TARGET_CHUNK_SIZE = 600;
const MAX_CHUNK_SIZE = 900;
const OVERLAP_SENTENCES = 2;

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .filter((s) => s.trim().length > 0);
}

function detectSectionTitle(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.length > 120 || trimmed.length < 3) return null;

  if (/^#{1,4}\s+/.test(trimmed)) {
    return trimmed.replace(/^#+\s*/, '');
  }

  if (/^[A-Z][A-Z\s:—\-]{4,}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d+\.\s+[A-Z]/.test(trimmed) && trimmed.length < 80) {
    return trimmed;
  }

  return null;
}

function chunkText(text: string): TextChunk[] {
  const lines = text.split('\n');
  const chunks: TextChunk[] = [];
  let currentSection: string | null = null;
  let buffer = '';
  let chunkIndex = 0;

  for (const line of lines) {
    const heading = detectSectionTitle(line);
    if (heading) {
      currentSection = heading;
    }

    buffer += line + '\n';
    const tokens = estimateTokens(buffer);

    if (tokens >= TARGET_CHUNK_SIZE) {
      const sentences = splitIntoSentences(buffer.trim());

      let chunkSentences: string[] = [];
      let chunkTokens = 0;

      for (const sentence of sentences) {
        const sentTokens = estimateTokens(sentence);
        if (chunkTokens + sentTokens > MAX_CHUNK_SIZE && chunkSentences.length > 0) {
          const chunkText = chunkSentences.join(' ').trim();
          if (chunkText.length > 50) {
            chunks.push({
              text: chunkText,
              index: chunkIndex++,
              sectionTitle: currentSection,
              tokenCount: estimateTokens(chunkText),
            });
          }

          const overlap = chunkSentences.slice(-OVERLAP_SENTENCES);
          chunkSentences = [...overlap];
          chunkTokens = estimateTokens(overlap.join(' '));
        }
        chunkSentences.push(sentence);
        chunkTokens += sentTokens;
      }

      buffer = chunkSentences.join(' ') + '\n';
    }
  }

  if (buffer.trim().length > 50) {
    chunks.push({
      text: buffer.trim(),
      index: chunkIndex,
      sectionTitle: currentSection,
      tokenCount: estimateTokens(buffer.trim()),
    });
  }

  return chunks;
}

export async function parsePdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

export function parseMarkdown(text: string): string {
  return text;
}

export function parsePlainText(text: string): string {
  return text;
}

export async function parseAndChunk(
  fileBuffer: Buffer,
  fileType: 'pdf' | 'txt' | 'md' | 'epub'
): Promise<TextChunk[]> {
  let rawText: string;

  switch (fileType) {
    case 'pdf':
      rawText = await parsePdf(fileBuffer);
      break;
    case 'md':
      rawText = parseMarkdown(fileBuffer.toString('utf-8'));
      break;
    case 'txt':
    case 'epub':
      rawText = parsePlainText(fileBuffer.toString('utf-8'));
      break;
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }

  rawText = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  return chunkText(rawText);
}
