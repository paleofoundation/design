'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { PALETTE, DASH, FONT, RADIUS, TEXT_SIZE } from '@/lib/design-tokens';

type ToolName =
  | 'ingest-design' | 'get-design-profile' | 'check-design-consistency'
  | 'search-design-patterns' | 'generate-font' | 'pair-typography'
  | 'convert-design-to-code' | 'generate-component-library'
  | 'generate-page' | 'suggest-improvements' | 'generate-theme-variants'
  | 'generate-layout' | 'design-diff' | 'generate-responsive-rules'
  | 'query-design-knowledge';

const TOOLS: { value: ToolName; label: string }[] = [
  { value: 'ingest-design', label: 'Ingest Design' },
  { value: 'get-design-profile', label: 'Get Design Profile' },
  { value: 'check-design-consistency', label: 'Check Design Consistency' },
  { value: 'generate-component-library', label: 'Generate Component Library' },
  { value: 'generate-page', label: 'Generate Page' },
  { value: 'generate-layout', label: 'Generate Layout' },
  { value: 'generate-theme-variants', label: 'Generate Theme Variants' },
  { value: 'generate-responsive-rules', label: 'Generate Responsive Rules' },
  { value: 'suggest-improvements', label: 'Suggest Improvements' },
  { value: 'design-diff', label: 'Design Diff' },
  { value: 'search-design-patterns', label: 'Search Design Patterns' },
  { value: 'generate-font', label: 'Generate Font' },
  { value: 'pair-typography', label: 'Pair Typography' },
  { value: 'convert-design-to-code', label: 'Convert Design to Code' },
  { value: 'query-design-knowledge', label: 'Query Design Knowledge' },
];

const TOOL_NAME_MAP: Record<ToolName, string> = {
  'ingest-design': 'ingest-design', 'get-design-profile': 'get-design-profile',
  'check-design-consistency': 'check-design-consistency', 'search-design-patterns': 'search-patterns',
  'generate-font': 'generate-font', 'pair-typography': 'pair-typography',
  'convert-design-to-code': 'convert-design', 'generate-component-library': 'generate-component-library',
  'generate-page': 'generate-page', 'suggest-improvements': 'suggest-improvements',
  'generate-theme-variants': 'generate-theme-variants', 'generate-layout': 'generate-layout',
  'design-diff': 'design-diff', 'generate-responsive-rules': 'generate-responsive-rules',
  'query-design-knowledge': 'query-design-knowledge',
};

interface ProfileOption { id: string; project_name: string; source_url: string; updated_at: string; }

const inputStyle: React.CSSProperties = {
  width: '100%', background: DASH.inputBg, border: `1px solid ${DASH.inputBorder}`,
  borderRadius: RADIUS.md, padding: '0.5rem 0.75rem', fontSize: TEXT_SIZE.sm,
  color: DASH.heading, outline: 'none', fontFamily: 'inherit',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: TEXT_SIZE.sm, color: DASH.muted, marginBottom: '0.25rem' };

export default function PlaygroundPage() {
  const [tool, setTool] = useState<ToolName>('ingest-design');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [url, setUrl] = useState('');
  const [projectName, setProjectName] = useState('');
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
  const [componentCode, setComponentCode] = useState('');
  const [framework, setFramework] = useState('react_tailwind');
  const [componentsFilter, setComponentsFilter] = useState('');
  const [pageType, setPageType] = useState('dashboard');
  const [pageDescription, setPageDescription] = useState('');
  const [pageFramework, setPageFramework] = useState('nextjs');
  const [includeSampleData, setIncludeSampleData] = useState(true);
  const [focusAreas, setFocusAreas] = useState<string[]>(['all']);
  const [improvementsUrl, setImprovementsUrl] = useState('');
  const [improvementsCode, setImprovementsCode] = useState('');
  const [themeVariants, setThemeVariants] = useState<string[]>(['dark']);
  const [layoutType, setLayoutType] = useState('dashboard_sidebar');
  const [layoutFeatures, setLayoutFeatures] = useState<string[]>([]);
  const [layoutFramework, setLayoutFramework] = useState('nextjs');
  const [diffSource, setDiffSource] = useState('');
  const [diffTarget, setDiffTarget] = useState('');
  const [knowledgeQuery, setKnowledgeQuery] = useState('');
  const [responsiveUrl, setResponsiveUrl] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/profiles').then((r) => r.json()).then((d) => { if (d.profiles) setProfiles(d.profiles); }).catch(() => {});
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImageBase64((reader.result as string).split(',')[1]); setImageUrl(''); };
    reader.readAsDataURL(file);
  }

  function buildParams(): Record<string, unknown> {
    const proj = selectedProject || undefined;
    switch (tool) {
      case 'ingest-design': return { url, projectName: projectName || 'default' };
      case 'get-design-profile': return { projectName: proj };
      case 'check-design-consistency': return { componentCode, projectName: proj };
      case 'search-design-patterns': { const p: Record<string, unknown> = { query, projectName: proj }; if (category) p.category = category; if (tags) p.tags = tags.split(',').map((t) => t.trim()); return p; }
      case 'generate-font': { const p: Record<string, unknown> = { description, projectName: proj }; if (fontStyle) p.style = fontStyle; if (weight) p.weight = weight; if (useCase) p.useCase = useCase; return p; }
      case 'pair-typography': return { headingFont: headingFont || undefined, mood: mood || undefined, context: context || undefined, projectName: proj };
      case 'convert-design-to-code': return { imageUrl: imageBase64 ? `data:image/png;base64,${imageBase64}` : imageUrl, outputFormat, projectName: proj };
      case 'generate-component-library': { const p: Record<string, unknown> = { projectName: proj || projectName || 'default', framework }; if (componentsFilter.trim()) p.components = componentsFilter.split(',').map((c) => c.trim()); return p; }
      case 'generate-page': return { projectName: proj || projectName || 'default', pageType, description: pageDescription || undefined, framework: pageFramework, includeSampleData };
      case 'suggest-improvements': { const p: Record<string, unknown> = { projectName: proj }; if (improvementsUrl) p.url = improvementsUrl; if (improvementsCode) p.componentCode = improvementsCode; if (focusAreas.length) p.focusAreas = focusAreas; return p; }
      case 'generate-theme-variants': return { projectName: proj || projectName || 'default', variants: themeVariants };
      case 'generate-layout': return { projectName: proj || projectName || 'default', layoutType, features: layoutFeatures.length ? layoutFeatures : undefined, framework: layoutFramework };
      case 'design-diff': return { source: diffSource, target: diffTarget, projectName: proj };
      case 'generate-responsive-rules': return { projectName: proj || projectName || 'default', url: responsiveUrl || undefined };
      case 'query-design-knowledge': return { query: knowledgeQuery, projectName: proj };
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch('/api/mcp/mcp', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: TOOL_NAME_MAP[tool], arguments: buildParams() } }),
      });
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader(); if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder(); let buffer = ''; let lastData = '';
        while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split('\n'); buffer = lines.pop() ?? ''; for (const line of lines) { if (line.startsWith('data: ')) lastData = line.slice(6); } }
        if (buffer.startsWith('data: ')) lastData = buffer.slice(6);
        if (lastData) { try { setResult(JSON.stringify(JSON.parse(lastData), null, 2)); } catch { setResult(lastData); } } else { setResult('(Empty response from server)'); }
      } else {
        const text = await res.text(); try { setResult(JSON.stringify(JSON.parse(text), null, 2)); } catch { setResult(text || '(Empty response)'); }
      }
      if (tool === 'ingest-design') { fetch('/api/dashboard/profiles').then((r) => r.json()).then((d) => { if (d.profiles) setProfiles(d.profiles); }).catch(() => {}); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Request failed'); }
    finally { setLoading(false); }
  }

  const showProjectDropdown = tool !== 'ingest-design';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontFamily: FONT.heading, fontSize: TEXT_SIZE['2xl'], fontWeight: 400, color: DASH.heading, letterSpacing: '-0.02em' }}>Playground</h2>
        <p style={{ marginTop: '0.25rem', fontSize: TEXT_SIZE.sm, color: DASH.muted }}>Test DesignEngine tools directly from your browser.</p>
      </div>

      {profiles.length > 0 && showProjectDropdown && (
        <div style={{ background: PALETTE.orange.muted, border: `1px solid rgba(255, 103, 25, 0.15)`, borderRadius: RADIUS.md, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: TEXT_SIZE.sm, color: PALETTE.orange.base, whiteSpace: 'nowrap', fontWeight: 500 }}>Design Profile:</div>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
            <option value="">None (no profile constraint)</option>
            {profiles.map((p) => <option key={p.id} value={p.project_name}>{p.project_name} — {p.source_url || 'no url'}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 24rem), 1fr))' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: DASH.card, border: `1px solid ${DASH.cardBorder}`, borderRadius: RADIUS.lg, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={labelStyle}>Tool</label><select value={tool} onChange={(e) => setTool(e.target.value as ToolName)} style={inputStyle}>{TOOLS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>

            {tool === 'ingest-design' && (<><Field label="URL" value={url} onChange={setUrl} placeholder="https://example.com" /><Field label="Project Name" value={projectName} onChange={setProjectName} placeholder="my-project" /></>)}
            {tool === 'get-design-profile' && (<div style={{ fontSize: TEXT_SIZE.sm, color: DASH.muted, padding: '0.5rem 0' }}>{selectedProject ? `Will load profile for "${selectedProject}".` : 'Will load the most recent design profile.'}</div>)}
            {tool === 'check-design-consistency' && (<TextareaField label="Component Code" value={componentCode} onChange={setComponentCode} placeholder="Paste your JSX/TSX, HTML, or CSS here..." rows={10} mono />)}
            {tool === 'generate-component-library' && (<><SelectField label="Framework" value={framework} onChange={setFramework} options={['react_tailwind', 'react_css', 'html_css', 'vue_tailwind']} /><Field label="Components (optional, comma-separated)" value={componentsFilter} onChange={setComponentsFilter} placeholder="Button, Card, Input — leave blank for all" /></>)}
            {tool === 'generate-page' && (<><SelectField label="Page Type" value={pageType} onChange={setPageType} options={['landing', 'pricing', 'about', 'contact', 'dashboard', 'settings', 'profile', 'analytics', 'table_view', 'form', 'auth_login', 'auth_signup', 'blog_list', 'blog_post', 'docs', '404', 'empty_state']} /><TextareaField label="Description (optional)" value={pageDescription} onChange={setPageDescription} placeholder="Additional context about the page..." rows={3} /><SelectField label="Framework" value={pageFramework} onChange={setPageFramework} options={['nextjs', 'react_tailwind', 'html_css']} /><CheckboxField label="Include sample data" checked={includeSampleData} onChange={setIncludeSampleData} /></>)}
            {tool === 'generate-layout' && (<><SelectField label="Layout Type" value={layoutType} onChange={setLayoutType} options={['dashboard_sidebar', 'dashboard_topnav', 'marketing', 'docs_sidebar', 'blog', 'minimal', 'split_panel']} /><MultiCheckField label="Features" options={['search', 'user_menu', 'notifications', 'breadcrumbs', 'footer', 'mobile_drawer']} selected={layoutFeatures} onChange={setLayoutFeatures} /><SelectField label="Framework" value={layoutFramework} onChange={setLayoutFramework} options={['nextjs', 'react_tailwind', 'html_css']} /></>)}
            {tool === 'generate-theme-variants' && (<MultiCheckField label="Variants" options={['dark', 'light', 'high_contrast', 'muted', 'vibrant']} selected={themeVariants} onChange={setThemeVariants} />)}
            {tool === 'generate-responsive-rules' && (<Field label="URL to analyze (optional)" value={responsiveUrl} onChange={setResponsiveUrl} placeholder="https://example.com" />)}
            {tool === 'suggest-improvements' && (<><Field label="URL (optional)" value={improvementsUrl} onChange={setImprovementsUrl} placeholder="https://example.com" /><TextareaField label="Component Code (optional)" value={improvementsCode} onChange={setImprovementsCode} placeholder="Paste code to analyze..." rows={6} mono /><MultiCheckField label="Focus Areas" options={['accessibility', 'whitespace', 'hierarchy', 'contrast', 'responsive', 'animation', 'consistency', 'all']} selected={focusAreas} onChange={setFocusAreas} /></>)}
            {tool === 'design-diff' && (<><TextareaField label="Source (expected)" value={diffSource} onChange={setDiffSource} placeholder="https://example.com or paste code..." rows={5} mono /><TextareaField label="Target (actual)" value={diffTarget} onChange={setDiffTarget} placeholder="https://implementation.com or paste code..." rows={5} mono /></>)}
            {tool === 'search-design-patterns' && (<><Field label="Query" value={query} onChange={setQuery} placeholder="dark mode dashboard with gradients" /><Field label="Category (optional)" value={category} onChange={setCategory} placeholder="e.g. dashboard, landing, ecommerce" /><Field label="Tags (optional, comma-separated)" value={tags} onChange={setTags} placeholder="dark-mode, gradient, minimal" /></>)}
            {tool === 'generate-font' && (<><TextareaField label="Description" value={description} onChange={setDescription} placeholder="A clean, modern sans-serif for a tech startup..." rows={3} /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}><SelectField label="Style" value={fontStyle} onChange={setFontStyle} options={['', 'serif', 'sans-serif', 'monospace', 'display', 'handwriting']} /><SelectField label="Weight" value={weight} onChange={setWeight} options={['', 'light', 'regular', 'medium', 'bold', 'black']} /><SelectField label="Use Case" value={useCase} onChange={setUseCase} options={['', 'heading', 'body', 'ui', 'code', 'branding']} /></div></>)}
            {tool === 'pair-typography' && (<><Field label="Heading Font (optional)" value={headingFont} onChange={setHeadingFont} placeholder="e.g. Inter, Playfair Display" /><Field label="Mood" value={mood} onChange={setMood} placeholder="e.g. professional, playful, elegant" /><Field label="Context" value={context} onChange={setContext} placeholder="e.g. SaaS landing page, editorial blog" /></>)}
            {tool === 'query-design-knowledge' && (<Field label="Design Question" value={knowledgeQuery} onChange={setKnowledgeQuery} placeholder="e.g. what makes good color contrast for accessibility?" />)}
            {tool === 'convert-design-to-code' && (<><Field label="Image URL" value={imageUrl} onChange={(v) => { setImageUrl(v); setImageBase64(''); }} placeholder="https://example.com/screenshot.png" /><div><label style={labelStyle}>Or upload an image</label><input type="file" accept="image/*" onChange={handleFileUpload} style={{ width: '100%', fontSize: TEXT_SIZE.sm, color: DASH.muted }} />{imageBase64 && <p style={{ marginTop: '0.25rem', fontSize: TEXT_SIZE.xs, color: PALETTE.semantic.success }}>Image loaded (base64)</p>}</div><SelectField label="Output Format" value={outputFormat} onChange={setOutputFormat} options={['html_css', 'html_tailwind', 'react_tailwind']} /></>)}
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', background: PALETTE.orange.base, color: PALETTE.text.onDark,
            borderRadius: RADIUS.md, padding: '0.75rem 1rem', fontSize: TEXT_SIZE.sm, fontWeight: 500,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit',
          }}>
            {loading && <Spinner />} {loading ? 'Running...' : 'Run Tool'}
          </button>
        </form>

        <div style={{ background: DASH.card, border: `1px solid ${DASH.cardBorder}`, borderRadius: RADIUS.lg, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: TEXT_SIZE.sm, fontWeight: 500, color: DASH.muted, marginBottom: '0.75rem' }}>Response</h3>
          {error && (
            <div style={{ background: PALETTE.semantic.errorMuted, border: `1px solid rgba(220,53,69,0.15)`, borderRadius: RADIUS.md, padding: '1rem', marginBottom: '0.75rem', fontSize: TEXT_SIZE.sm, color: PALETTE.semantic.error }}>{error}</div>
          )}
          <pre style={{
            flex: 1, overflow: 'auto', borderRadius: RADIUS.md, background: DASH.codeBg,
            border: `1px solid ${DASH.divider}`, padding: '1rem', fontSize: TEXT_SIZE.xs,
            lineHeight: 1.7, minHeight: '300px', maxHeight: '600px', margin: 0,
            fontFamily: FONT.mono, color: DASH.body,
          }}>
            {result ? <ColoredJson json={result} /> : <span style={{ color: DASH.faint }}>Run a tool to see the response here.</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return <div><label style={labelStyle}>{label}</label><input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} /></div>;
}
function TextareaField({ label, value, onChange, placeholder, rows = 4, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; rows?: number; mono?: boolean }) {
  return <div><label style={labelStyle}>{label}</label><textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize: 'none' as const, fontFamily: mono ? FONT.mono : 'inherit' }} /></div>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div><label style={labelStyle}>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>{options.map((o) => <option key={o} value={o}>{o || '— any —'}</option>)}</select></div>;
}
function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: TEXT_SIZE.sm, color: DASH.body, cursor: 'pointer' }}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>;
}
function MultiCheckField({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(opt: string) { onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]); }
  return (
    <div><label style={{ ...labelStyle, marginBottom: '0.5rem' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => toggle(opt)} style={{
            padding: '0.25rem 0.75rem', borderRadius: RADIUS.full, fontSize: TEXT_SIZE.xs, fontWeight: 500,
            border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
            background: selected.includes(opt) ? PALETTE.orange.base : DASH.card,
            borderColor: selected.includes(opt) ? PALETTE.orange.base : DASH.cardBorder,
            color: selected.includes(opt) ? PALETTE.text.onDark : DASH.body,
          }}>{opt.replace(/_/g, ' ')}</button>
        ))}
      </div>
    </div>
  );
}
function Spinner() {
  return <svg style={{ animation: 'spin 1s linear infinite', height: '1rem', width: '1rem' }} viewBox="0 0 24 24" fill="none"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;
}
function ColoredJson({ json }: { json: string }) {
  const colored = json
    .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, `<span style="color:${PALETTE.green.deep}">$1</span>$2`)
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, `: <span style="color:${DASH.heading}">$1</span>`)
    .replace(/:\s*(\d+\.?\d*)/g, `: <span style="color:${PALETTE.orange.base}">$1</span>`)
    .replace(/:\s*(true|false|null)/g, `: <span style="color:${PALETTE.lavender.base}">$1</span>`);
  return <code dangerouslySetInnerHTML={{ __html: colored }} />;
}
