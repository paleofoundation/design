# AGENTS.md

## Cursor Cloud specific instructions

### Project structure

This is a single Next.js 16 application located in `designengine/`. All commands should be run from that directory.

### Key commands

| Task | Command |
|------|---------|
| Install deps | `npm install` (uses `legacy-peer-deps=true` via `.npmrc`) |
| Dev server | `npm run dev` (port 3000) |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Seed knowledge base | `npm run seed` (requires live Supabase + OpenAI keys) |

### Environment variables

A `.env.local` file is needed in `designengine/` with at minimum:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`, `FIRECRAWL_API_KEY`
- `NEXT_PUBLIC_APP_URL` (defaults to `http://localhost:3000`)

Optional: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `REPLICATE_API_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`.

Placeholder values are sufficient to start the dev server and render all static/SSR pages. API-dependent features (auth, MCP tools, billing) require real keys.

### Non-obvious caveats

- ESLint has 11 pre-existing errors (mostly `react-hooks/rules-of-hooks` in onboarding pages and one `@typescript-eslint/no-explicit-any`). These are existing code issues and do not block the build.
- The build compiles successfully even with lint errors because `next build` does not enforce ESLint by default with the flat config.
- There are no automated test suites (`npm test` is not defined). Validation is done via lint + build + manual testing.
- The project uses `npm` (not pnpm/yarn). The `.npmrc` sets `legacy-peer-deps=true` which is required for clean installs.
- Next.js 16 shows a deprecation warning about `middleware` → `proxy` file convention; this is cosmetic and does not affect functionality.
