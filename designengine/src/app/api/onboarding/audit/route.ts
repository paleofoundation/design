import { NextRequest, NextResponse } from 'next/server';
import { ingestDesignFromUrl } from '@/lib/firecrawl/ingest';
import { openai } from '@/lib/openai/client';
import { DESIGN_KNOWLEDGE_PROMPT } from '@/lib/mcp/tools/shared/design-knowledge';

export interface AuditImprovement {
  category: string;
  severity: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  impact: string;
}

export interface AuditResult {
  overallScore: number;
  improvements: AuditImprovement[];
  quickWins: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { url, tokens } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'A valid URL is required' },
        { status: 400 },
      );
    }

    const normalized = url.startsWith('http') ? url : `https://${url}`;

    const ingestion = await ingestDesignFromUrl(normalized, {
      includeHtml: true,
      includeMarkdown: false,
      includeScreenshot: false,
    });

    if (!ingestion.success || !ingestion.html) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch the site for analysis.',
      });
    }

    const truncatedHtml = ingestion.html.slice(0, 25000);

    const tokensContext = tokens
      ? `\n\nThe user's NEW design tokens (what they are migrating TO):\n${JSON.stringify(tokens, null, 2)}`
      : '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert UI/UX design auditor. You have deep knowledge of design conventions and accessibility standards.

${DESIGN_KNOWLEDGE_PROMPT}

Your job: Analyze the CURRENT state of a website's HTML/CSS and identify design convention violations, accessibility issues, and areas for improvement. Be specific — reference exact colors, sizes, spacing values, and elements.

The user wants to understand what their CURRENT site does wrong so they feel confident about their new design system.

Frame violations in terms of established design principles (60/30/10 rule, WCAG contrast, typographic scale, whitespace rhythm, visual hierarchy, etc.).${tokensContext}

Return ONLY valid JSON:
{
  "overallScore": 0-100,
  "improvements": [
    {
      "category": "accessibility|whitespace|hierarchy|contrast|responsive|consistency|typography|color-theory",
      "severity": "high|medium|low",
      "issue": "specific description of the problem found in the current site",
      "suggestion": "specific, actionable fix referencing the new design tokens when applicable",
      "impact": "why this matters for users and business"
    }
  ],
  "quickWins": ["top 3 highest-impact changes the new design system addresses"]
}

Order improvements by severity (high first). Include 5-10 improvements. Be educational — explain WHY each issue matters using design theory.`,
        },
        {
          role: 'user',
          content: `Audit this page (${normalized}):\n\n\`\`\`html\n${truncatedHtml}\n\`\`\``,
        },
      ],
      temperature: 0.3,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0].message.content;
    if (!raw) throw new Error('OpenAI returned empty response');

    const result: AuditResult = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      url: normalized,
      overallScore: result.overallScore ?? 0,
      improvements: result.improvements || [],
      quickWins: result.quickWins || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Audit failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
