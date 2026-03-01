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

const MIN_TOKENS_PER_PAGE = 100;
const OCR_CONCURRENCY = 5;

async function ocrWithVision(base64Image: string): Promise<string> {
  const { openai } = await import('@/lib/openai/client');
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/png;base64,${base64Image}`, detail: 'high' },
          },
          {
            type: 'text',
            text: 'Extract all text from this page. Preserve paragraph breaks and heading structure. Return only the extracted text, nothing else.',
          },
        ],
      },
    ],
    max_tokens: 4000,
    temperature: 0,
  });
  return response.choices[0].message.content || '';
}

async function ocrPdfPages(buffer: Buffer): Promise<string> {
  const { getDocumentProxy, renderPageAsImage } = await import('unpdf');
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const totalPages = pdf.numPages;
  const pageTexts: string[] = new Array(totalPages).fill('');

  for (let batchStart = 0; batchStart < totalPages; batchStart += OCR_CONCURRENCY) {
    const batchEnd = Math.min(batchStart + OCR_CONCURRENCY, totalPages);
    const promises = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const pageNum = i + 1;
      promises.push(
        (async () => {
          try {
            const imageData = await renderPageAsImage(pdf, pageNum, { scale: 2 });
            const base64 = Buffer.from(imageData).toString('base64');
            pageTexts[i] = await ocrWithVision(base64);
          } catch {
            pageTexts[i] = '';
          }
        })(),
      );
    }

    await Promise.all(promises);
  }

  return pageTexts.filter(Boolean).join('\n\n');
}

export async function parsePdf(buffer: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import('unpdf');
  const data = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(data);
  const { text, totalPages } = await extractText(pdf, { mergePages: true });

  const extracted = typeof text === 'string' ? text : (text as string[]).join('\n');
  const tokenCount = estimateTokens(extracted);
  const tokensPerPage = totalPages > 0 ? tokenCount / totalPages : 0;

  if (tokensPerPage >= MIN_TOKENS_PER_PAGE && extracted.trim().length > 0) {
    return extracted;
  }

  // Text extraction was poor — fall back to GPT-4o Vision OCR
  const ocrText = await ocrPdfPages(buffer);

  if (!ocrText || ocrText.trim().length === 0) {
    if (extracted.trim().length > 0) return extracted;
    throw new Error('No text could be extracted from this PDF, even with OCR. The file may be corrupted or contain only images without readable text.');
  }

  return ocrText;
}

export function parseMarkdown(text: string): string {
  return text;
}

export function parsePlainText(text: string): string {
  return text;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function parseEpub(buffer: Buffer): Promise<string> {
  const { EPub } = await import('epub');
  const epub = new EPub(buffer);
  await epub.parse();

  const chapters: string[] = [];

  for (const item of epub.flow) {
    try {
      const html = await epub.getChapterRaw(item.id);
      const text = stripHtml(html);
      if (text.length > 20) {
        const title = item.title ? `## ${item.title}\n\n` : '';
        chapters.push(title + text);
      }
    } catch {
      // Some items in the flow may not be valid chapters (images, etc.)
    }
  }

  if (chapters.length === 0) {
    throw new Error('No readable chapters found in this EPUB file.');
  }

  return chapters.join('\n\n');
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
    case 'epub':
      rawText = await parseEpub(fileBuffer);
      break;
    case 'txt':
      rawText = parsePlainText(fileBuffer.toString('utf-8'));
      break;
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }

  rawText = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  return chunkText(rawText);
}
