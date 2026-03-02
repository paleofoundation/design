import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export interface VisualStyleProfile {
  illustrationTechnique: string;
  lineCharacteristics: {
    weight: string;
    consistency: string;
    quality: string;
  };
  shadingApproach: string;
  colorTreatment: string;
  detailLevel: string;
  compositionStyle: string;
  texturePresence: string;
  dimensionality: string;
  mood: string;
  dominantColors: string[];
  artDirection: string;
  dallePromptFragment: string;
  cssFilterHint: string;
}

const ANALYSIS_PROMPT = `You are a senior art director analyzing a reference image to extract its visual style for reproduction.

Analyze this image and return a JSON object with these exact fields:

{
  "illustrationTechnique": "<e.g. 'flat vector with dimensional accents', 'clean line art', 'watercolor wash', 'isometric 3D', 'photo-realistic'>",
  "lineCharacteristics": {
    "weight": "<e.g. 'medium 2-3px', 'thin hairline', 'bold 4px+', 'variable'>",
    "consistency": "<e.g. 'uniform machine-precise', 'hand-drawn organic', 'mixed'>",
    "quality": "<e.g. 'smooth vector', 'sketchy', 'architectural', 'calligraphic'>"
  },
  "shadingApproach": "<e.g. 'flat fills only', 'subtle gradients within shapes', 'dramatic light/shadow', 'cross-hatching', 'ambient occlusion'>",
  "colorTreatment": "<how colors are applied — e.g. 'dark tones dominate with warm accent pops', 'pastel and muted', 'high saturation', 'monochromatic with one accent'>",
  "detailLevel": "<e.g. 'high — intricate architectural detail', 'medium — recognizable objects with simplified geometry', 'low — abstract shapes'>",
  "compositionStyle": "<e.g. 'asymmetric scene with depth layers', 'centered icon', 'full-bleed narrative scene', 'scattered objects on surface'>",
  "texturePresence": "<e.g. 'smooth and clean', 'subtle paper grain', 'heavy texture/distress', 'glossy/reflective'>",
  "dimensionality": "<e.g. 'flat 2D', 'pseudo-3D with implied depth via overlapping and shadow', 'full 3D perspective', 'isometric'>",
  "mood": "<2-4 words capturing the emotional tone — e.g. 'warm, editorial, sophisticated', 'playful and vibrant', 'minimal and technical'>",
  "dominantColors": ["<list 4-6 hex colors you see most prominently>"],
  "artDirection": "<A 2-3 sentence summary a designer would use to brief an illustrator: describe the overall feel, what makes this style distinctive, and how to reproduce it>",
  "dallePromptFragment": "<A 1-2 sentence style instruction you would append to any DALL-E prompt to reproduce this style. Be extremely specific about technique, color treatment, line quality, and shading. Do NOT describe subject matter — only style.>",
  "cssFilterHint": "<CSS filter string that approximates the color mood, e.g. 'saturate(0.9) contrast(1.05)' or 'none'>"
}

Be precise and specific. Avoid generic descriptions. If the image shows an illustration, focus on what makes the illustration style distinctive and reproducible. Return ONLY valid JSON, no markdown fences.`;

async function analyzeImageWithVision(imageInput: string): Promise<VisualStyleProfile> {
  const { openai } = await import('@/lib/openai/client');

  const isUrl = imageInput.startsWith('http://') || imageInput.startsWith('https://');
  const isBase64 = imageInput.startsWith('data:image/');

  let imageContent: { type: 'image_url'; image_url: { url: string; detail: 'high' } };

  if (isUrl) {
    imageContent = { type: 'image_url', image_url: { url: imageInput, detail: 'high' } };
  } else if (isBase64) {
    imageContent = { type: 'image_url', image_url: { url: imageInput, detail: 'high' } };
  } else {
    throw new Error('Image input must be a URL (http/https) or a base64 data URI (data:image/...)');
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: ANALYSIS_PROMPT },
          imageContent,
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('GPT-4o returned empty response');

  const cleaned = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleaned) as VisualStyleProfile;
  return parsed;
}

export function registerExtractVisualStyleTool(server: McpServer): void {
  server.tool(
    'extract-visual-style',
    'Analyze a reference image using GPT-4o vision to extract a structured visual style profile. Use this when a user provides an inspiration image — the output describes illustration technique, line quality, shading, color treatment, composition, and mood in a format that feeds directly into generate-illustrations and generate-art-style. This is how Refine Design ensures generated art matches the feel of a reference, not just the colors.',
    {
      imageUrl: z.string().optional().describe('URL of the reference image to analyze'),
      imageBase64: z.string().optional().describe('Base64-encoded image data (data:image/png;base64,...)'),
      context: z.string().optional().describe('Optional context about what this image is (e.g. "competitor homepage hero", "brand illustration style guide")'),
    },
    async ({ imageUrl, imageBase64, context }) => {
      try {
        const imageInput = imageUrl || imageBase64;
        if (!imageInput) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({ error: 'Provide either imageUrl or imageBase64' }),
            }],
            isError: true,
          };
        }

        const profile = await analyzeImageWithVision(imageInput);

        const result = {
          success: true,
          context: context || 'Reference image analysis',
          visualStyle: profile,
          usage: {
            feedIntoGenerateIllustrations: `Use the dallePromptFragment as a style suffix when calling generate-illustrations. Set mood to "${profile.mood}".`,
            feedIntoArtStyle: `The illustrationTechnique maps to art style presets: ${mapTechniqueToPreset(profile.illustrationTechnique)}`,
            feedIntoDesignProfile: 'Store this visualStyle object in the design profile under tokens.visualStyle for persistent reference across sessions.',
          },
          instructions: [
            '1. This visual style profile captures the artistic DNA of the reference image.',
            '2. Pass the dallePromptFragment to generate-illustrations as a style override.',
            '3. Store in the design profile so all future generations match this style.',
            '4. The dominantColors show the reference palette — compare with the user\'s brand colors.',
            '5. The artDirection field is a brief an illustrator could follow to reproduce this style.',
          ],
        };

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Visual style extraction failed';
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    },
  );
}

function mapTechniqueToPreset(technique: string): string {
  const t = technique.toLowerCase();
  if (t.includes('line art') || t.includes('line-art')) return 'Closest preset: "line-art"';
  if (t.includes('flat vector') || t.includes('flat-vector')) return 'Closest preset: "flat-vector"';
  if (t.includes('watercolor') || t.includes('water color')) return 'Closest preset: "watercolor"';
  if (t.includes('isometric') || t.includes('3d')) return 'Closest preset: "isometric"';
  if (t.includes('geometric') || t.includes('abstract')) return 'Closest preset: "abstract-geometric"';
  if (t.includes('photo') || t.includes('realistic')) return 'Closest preset: "photo-overlay"';
  return 'No exact match — consider creating a custom preset from this profile';
}
