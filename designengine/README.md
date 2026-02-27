# DesignEngine

AI-powered design tool MCP server. Extract design tokens from live URLs, search award-winning design patterns, generate fonts, pair typography, and convert screenshots to production code.

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Clients                             │
│  Claude Desktop · Cursor · Claude Code · Windsurf · etc.    │
└──────────────────────────┬──────────────────────────────────┘
                           │  MCP Protocol
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  DesignEngine Server                         │
│  ┌───────────┐  ┌───────────┐  ┌──────────────────────┐    │
│  │  Vercel   │  │   stdio   │  │  Streamable HTTP     │    │
│  │ /api/mcp  │  │  (npx)    │  │  (remote)            │    │
│  └─────┬─────┘  └─────┬─────┘  └──────────┬───────────┘    │
│        └───────────────┴───────────────────┘                │
│                        │                                    │
│  ┌─────────────────────┴─────────────────────────────────┐  │
│  │              5 MCP Tools                              │  │
│  │  ingest_design · search_design_patterns               │  │
│  │  generate_font · pair_typography                      │  │
│  │  convert_design_to_code                               │  │
│  └───────────────────────────────────────────────────────┘  │
│        │              │              │                       │
│  ┌─────┴────┐  ┌──────┴─────┐  ┌───┴────────┐              │
│  │ Firecrawl│  │  Supabase  │  │  OpenAI    │              │
│  │ scraping │  │  pgvector  │  │  GPT-4o    │              │
│  └──────────┘  └────────────┘  └────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Option 1: Cursor (remote URL — no install)

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "designengine": {
      "url": "https://designengine.vercel.app/api/mcp/mcp"
    }
  }
}
```

### Option 2: Claude Desktop (local via npx)

Add to your `claude_desktop_config.json`:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "designengine": {
      "command": "npx",
      "args": ["-y", "@designengine/mcp-server@latest"]
    }
  }
}
```

### Option 3: Claude Code (project-level)

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "designengine": {
      "command": "npx",
      "args": ["-y", "@designengine/mcp-server@latest"],
      "env": {
        "OPENAI_API_KEY": "your-key",
        "FIRECRAWL_API_KEY": "your-key",
        "NEXT_PUBLIC_SUPABASE_URL": "your-url",
        "SUPABASE_SERVICE_ROLE_KEY": "your-key"
      }
    }
  }
}
```

### Option 4: Windsurf

Add to `~/.codeium/windsurf/mcp_config.json` (same format as Claude Desktop).

## Tools

### `ingest_design`

Scrape a live URL and extract structured design tokens — colors, typography, spacing, and branding data.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL to scrape |
| `includeCss` | boolean | No | Return CSS custom properties |
| `includeTailwind` | boolean | No | Return Tailwind config |

**Example:**

```
Extract the design tokens from https://linear.app
```

**Sample output:**

```json
{
  "tokens": {
    "colors": {
      "primary": "#5E6AD2",
      "background": "#000000",
      "text": "#FFFFFF"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif",
      "headingSize": "48px"
    },
    "spacing": {
      "base": "8px"
    }
  },
  "cssVariables": "--color-primary: #5E6AD2; ...",
  "tailwindConfig": "{ theme: { extend: { ... } } }"
}
```

### `search_design_patterns`

Semantic search over a curated knowledge base of award-winning design patterns using pgvector embeddings.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |
| `category` | string | No | Filter by category |
| `tags` | string[] | No | Filter by tags |
| `limit` | number | No | Max results (default 5) |

**Example:**

```
Search for dark mode SaaS dashboard designs with gradient backgrounds
```

### `generate_font`

Get AI-powered Google Font recommendations with ready-to-use CSS imports, custom properties, and utility classes.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | Yes | Natural language description of desired font |
| `style` | string | No | `serif`, `sans-serif`, `monospace`, `display`, `handwriting` |
| `weight` | string | No | `light`, `regular`, `medium`, `bold`, `black` |
| `useCase` | string | No | `heading`, `body`, `ui`, `code`, `branding` |

**Example:**

```
Generate a clean, geometric sans-serif font for a fintech app
```

**Sample output:**

```json
{
  "fonts": [
    {
      "name": "DM Sans",
      "category": "sans-serif",
      "weights": [400, 500, 700],
      "cssImport": "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');",
      "cssVariables": "--font-primary: 'DM Sans', sans-serif;"
    }
  ],
  "htmlPreview": "<div style=\"font-family: 'DM Sans'\">...</div>"
}
```

### `pair_typography`

Generate harmonious heading + body font pairings with modular type scales, CSS, and Tailwind config.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `headingFont` | string | No | Preferred heading font |
| `mood` | string | No | e.g. `professional`, `playful`, `elegant` |
| `context` | string | No | e.g. `SaaS landing page`, `editorial blog` |

**Example:**

```
Pair typography for an elegant editorial magazine website
```

### `convert_design_to_code`

Convert a design screenshot to production-ready code using GPT-4o Vision.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imageUrl` | string | Yes | URL or base64 data URI of the screenshot |
| `outputFormat` | string | No | `html_css`, `html_tailwind`, `react_tailwind` (default) |
| `responsive` | boolean | No | Include responsive breakpoints |
| `animations` | boolean | No | Include CSS animations |
| `accessibility` | boolean | No | Include ARIA attributes |

**Example:**

```
Convert this screenshot to React + Tailwind code with responsive design
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `OPENAI_API_KEY` | Yes | OpenAI API key (GPT-4o + embeddings) |
| `FIRECRAWL_API_KEY` | Yes | Firecrawl API key for web scraping |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key for billing |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployed URL |

## Deployment

### 1. Database Setup

Run `src/lib/supabase/schema.sql` in the Supabase SQL Editor to create all tables, indexes, functions, and RLS policies.

### 2. Seed Knowledge Base

```bash
npm run seed
```

This embeds 100+ curated design patterns into the pgvector knowledge base.

### 3. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "DesignEngine v1.0.0"
git push -u origin main

# Deploy
vercel --prod
```

Set all environment variables in the Vercel dashboard under Settings > Environment Variables.

### 4. Configure Stripe Webhook

In the Stripe Dashboard under Developers > Webhooks:

1. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
2. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
3. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Vercel Firewall

In Vercel > Settings > Security > Firewall, create a bypass rule for "Request path starts with `/api/mcp`" to prevent DDoS protection from blocking MCP client connections.

### 6. Publish to npm

```bash
npm run build:mcp
npm publish --access public
```

### 7. Register with MCP Registry

```bash
mcp-publisher init
mcp-publisher login github
mcp-publisher publish
```

## Pricing

| Tool | Price per call |
|------|---------------|
| `ingest_design` | $0.10 |
| `search_design_patterns` | $0.02 |
| `generate_font` | $0.05 |
| `pair_typography` | $0.05 |
| `convert_design_to_code` | $0.25 |

## Dashboard

The web dashboard at `/dashboard` provides:

- **Overview** — stats, recent activity, quick actions
- **API Keys** — create, view, and revoke keys
- **Usage** — call volume charts, latency, error rates, costs
- **Playground** — test all 5 tools from the browser
- **Billing** — pricing, current spend, projected costs, payment management

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **AI:** OpenAI GPT-4o, text-embedding-3-small
- **Database:** Supabase (PostgreSQL + pgvector)
- **Scraping:** Firecrawl
- **Payments:** Stripe (metered billing)
- **Protocol:** Model Context Protocol (MCP)
- **Styling:** Tailwind CSS 4

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests where applicable
4. Ensure the build passes: `npm run build`
5. Submit a pull request

## License

MIT
