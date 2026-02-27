import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex max-w-2xl flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          DesignEngine
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          An MCP server that exposes AI-powered design tools — ingest sites,
          search patterns, generate fonts, pair typography, and convert designs
          to code.
        </p>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Open Dashboard
          </Link>
          <a
            href="/api/mcp"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            MCP Endpoint
          </a>
        </div>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {tool.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const tools = [
  {
    name: 'ingest-design',
    description: 'Crawl a URL and extract structured design tokens.',
  },
  {
    name: 'search-patterns',
    description: 'Semantic search across ingested design patterns.',
  },
  {
    name: 'generate-font',
    description: 'AI-powered font recommendations with CSS output.',
  },
  {
    name: 'pair-typography',
    description: 'Generate harmonious heading + body type pairings.',
  },
  {
    name: 'convert-design',
    description: 'Convert design tokens to production-ready code.',
  },
];
