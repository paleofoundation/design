'use client';

import { useState, type FormEvent } from 'react';

type ToolName =
  | 'ingest_design'
  | 'search_design_patterns'
  | 'generate_font'
  | 'pair_typography'
  | 'convert_design_to_code';

const TOOLS: { value: ToolName; label: string }[] = [
  { value: 'ingest_design', label: 'Ingest Design' },
  { value: 'search_design_patterns', label: 'Search Design Patterns' },
  { value: 'generate_font', label: 'Generate Font' },
  { value: 'pair_typography', label: 'Pair Typography' },
  { value: 'convert_design_to_code', label: 'Convert Design to Code' },
];

export default function PlaygroundPage() {
  const [tool, setTool] = useState<ToolName>('ingest_design');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [weight, setWeight] = useState('');
  const [useCase, setUseCase] = useState('');
  const [headingFont, setHeadingFont] = useState('');
  const [mood, setMood] = useState('');
  const [context, setContext] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [outputFormat, setOutputFormat] = useState('html_tailwind');
  const [imageBase64, setImageBase64] = useState('');

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1];
      setImageBase64(b64);
      setImageUrl('');
    };
    reader.readAsDataURL(file);
  }

  function buildParams(): Record<string, unknown> {
    switch (tool) {
      case 'ingest_design':
        return { url };
      case 'search_design_patterns': {
        const p: Record<string, unknown> = { query };
        if (category) p.category = category;
        if (tags) p.tags = tags.split(',').map((t) => t.trim());
        return p;
      }
      case 'generate_font': {
        const p: Record<string, unknown> = { description };
        if (fontStyle) p.style = fontStyle;
        if (weight) p.weight = weight;
        if (useCase) p.useCase = useCase;
        return p;
      }
      case 'pair_typography':
        return {
          headingFont: headingFont || undefined,
          mood: mood || undefined,
          context: context || undefined,
        };
      case 'convert_design_to_code':
        return {
          imageUrl: imageBase64
            ? `data:image/png;base64,${imageBase64}`
            : imageUrl,
          outputFormat,
        };
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/mcp/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: tool,
            arguments: buildParams(),
          },
        }),
      });

      const contentType = res.headers.get('content-type') ?? '';

      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let lastData = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              lastData = line.slice(6);
            }
          }
        }

        if (buffer.startsWith('data: ')) {
          lastData = buffer.slice(6);
        }

        if (lastData) {
          try {
            const parsed = JSON.parse(lastData);
            setResult(JSON.stringify(parsed, null, 2));
          } catch {
            setResult(lastData);
          }
        } else {
          setResult('(Empty response from server)');
        }
      } else {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          setResult(JSON.stringify(json, null, 2));
        } catch {
          setResult(text || '(Empty response)');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Playground</h2>
        <p className="mt-1 text-sm text-gray-400">
          Test DesignEngine tools directly from your browser.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input panel */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tool</label>
              <select
                value={tool}
                onChange={(e) => setTool(e.target.value as ToolName)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {TOOLS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {tool === 'ingest_design' && (
              <Field label="URL" value={url} onChange={setUrl} placeholder="https://example.com" />
            )}

            {tool === 'search_design_patterns' && (
              <>
                <Field
                  label="Query"
                  value={query}
                  onChange={setQuery}
                  placeholder="dark mode dashboard with gradients"
                />
                <Field
                  label="Category (optional)"
                  value={category}
                  onChange={setCategory}
                  placeholder="e.g. dashboard, landing, ecommerce"
                />
                <Field
                  label="Tags (optional, comma-separated)"
                  value={tags}
                  onChange={setTags}
                  placeholder="dark-mode, gradient, minimal"
                />
              </>
            )}

            {tool === 'generate_font' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A clean, modern sans-serif for a tech startup..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <SelectField
                    label="Style"
                    value={fontStyle}
                    onChange={setFontStyle}
                    options={['', 'serif', 'sans-serif', 'monospace', 'display', 'handwriting']}
                  />
                  <SelectField
                    label="Weight"
                    value={weight}
                    onChange={setWeight}
                    options={['', 'light', 'regular', 'medium', 'bold', 'black']}
                  />
                  <SelectField
                    label="Use Case"
                    value={useCase}
                    onChange={setUseCase}
                    options={['', 'heading', 'body', 'ui', 'code', 'branding']}
                  />
                </div>
              </>
            )}

            {tool === 'pair_typography' && (
              <>
                <Field
                  label="Heading Font (optional)"
                  value={headingFont}
                  onChange={setHeadingFont}
                  placeholder="e.g. Inter, Playfair Display"
                />
                <Field
                  label="Mood"
                  value={mood}
                  onChange={setMood}
                  placeholder="e.g. professional, playful, elegant"
                />
                <Field
                  label="Context"
                  value={context}
                  onChange={setContext}
                  placeholder="e.g. SaaS landing page, editorial blog"
                />
              </>
            )}

            {tool === 'convert_design_to_code' && (
              <>
                <Field
                  label="Image URL"
                  value={imageUrl}
                  onChange={(v) => {
                    setImageUrl(v);
                    setImageBase64('');
                  }}
                  placeholder="https://example.com/screenshot.png"
                />
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Or upload an image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-800 file:px-3 file:py-2 file:text-sm file:text-white file:cursor-pointer hover:file:bg-gray-700"
                  />
                  {imageBase64 && (
                    <p className="mt-1 text-xs text-emerald-400">Image loaded (base64)</p>
                  )}
                </div>
                <SelectField
                  label="Output Format"
                  value={outputFormat}
                  onChange={setOutputFormat}
                  options={['html_css', 'html_tailwind', 'react_tailwind']}
                />
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            {loading ? 'Running…' : 'Run Tool'}
          </button>
        </form>

        {/* Output panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Response</h3>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <pre className="flex-1 overflow-auto rounded-lg bg-gray-950 border border-gray-800 p-4 text-xs leading-relaxed min-h-[300px] max-h-[600px]">
            {result ? <ColoredJson json={result} /> : (
              <span className="text-gray-600">
                Run a tool to see the response here.
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || '— any —'}
          </option>
        ))}
      </select>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function ColoredJson({ json }: { json: string }) {
  const colored = json
    .replace(
      /("(?:[^"\\]|\\.)*")(\s*:)/g,
      '<span style="color:#818cf8">$1</span>$2'
    )
    .replace(
      /:\s*("(?:[^"\\]|\\.)*")/g,
      ': <span style="color:#34d399">$1</span>'
    )
    .replace(
      /:\s*(\d+\.?\d*)/g,
      ': <span style="color:#fbbf24">$1</span>'
    )
    .replace(
      /:\s*(true|false|null)/g,
      ': <span style="color:#f87171">$1</span>'
    );

  return <code dangerouslySetInnerHTML={{ __html: colored }} />;
}
