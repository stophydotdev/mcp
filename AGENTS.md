# @stophy/mcp

The local (stdio) and self-hostable (HTTP) MCP server for Stophy: YouTube context API for AI agents. It wraps the Stophy API (`https://api.stophy.dev/v1`: search, suggest, video details/transcript/comments/livechat, channel, playlist, credits) and exposes each endpoint as an MCP tool, emitting structured JSON. The server holds no YouTube logic of its own: every tool is a thin, typed wrapper that forwards to the Stophy API, which owns auth, credits, caching, and normalization. Written in TypeScript as an **ESM** package, built with `bun build` to `dist/`, published to npm as `@stophy/mcp` (run via `npx -y @stophy/mcp`) and listed in the MCP registry as `io.github.stophydotdev/mcp`.

The hosted HTTP endpoint (`mcp.stophy.dev`) is deployed from a separate private repo; do not add hosting/deploy infra here.

## Layout

```
src/
  index.ts        # stdio entry: builds the server, connects StdioServerTransport (the npx/bin target)
  http.ts         # self-host HTTP transport (Hono); API key in the URL path
  server.ts       # createServer(): registers every tool. The one file you touch per tool change
  client.ts       # stophyFetch<T>() + StophyError; the single HTTP path to the Stophy API
  context.ts      # apiKeyStore (AsyncLocalStorage): per-request API key in HTTP mode
  tools/
    <name>.ts     # one file per tool: exports `<name>Schema` (zod shape) + `<name>Tool` (handler)
.github/workflows/
  publish.yml     # tokenless npm publish via trusted publishing + MCP registry sync
  version.yml     # Changesets version PR on main
  test.yml        # type-check + build on PR and push to main
.changeset/
  config.json     # Changesets release config
  README.md       # local release workflow notes
server.json       # MCP registry manifest (name, npm identifier, env vars); version synced on publish
package.json      # name, version, bin, mcpName (must equal server.json "name")
smithery.yaml     # Smithery listing config
README.md         # human-facing connect instructions + per-tool reference
AGENTS.md         # this file
CLAUDE.md         # @AGENTS.md (cross-agent include)
```

## Conventions

- **Language & build.** TypeScript only, **ESM** (`"type": "module"`, `moduleResolution` = `bundler`). `bun build` bundles `src/index.ts` → `dist/index.js` (Node target, minified); `build:http` bundles the HTTP entry. The bin `stophy-mcp` points at `dist/index.js`. The published artifact targets Node `>=18`. Never edit `dist/` by hand; never commit it.
- **ESM import rules.** Relative imports **must** carry the `.js` extension (e.g. `import { stophyFetch } from "./client.js"`); that's the compiled path, even though the source is `.ts`. `verbatimModuleSyntax` is on, so use `import type { ... }` for type-only imports.
- **Dependencies.** Runtime deps are deliberate and few: `@modelcontextprotocol/sdk` (MCP), `zod` (schemas), `hono` + `@hono/node-server` (HTTP transport). Don't reach for a new dependency when one of these or a Node built-in (`fetch`, `node:async_hooks`) covers it.
- **Branches & commits.** Work on a new branch for each change; do not make normal feature, fix, or release-infra commits directly on `main`. Use Conventional Commit style: `<type>(<scope>): <summary>` (for example, `feat(tools): add captions tool`). Keep the summary imperative, lowercase, and concise.
- **Type safety.** Source is strict TypeScript (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`/`noUnusedParameters`). Run `bun run check-types` after every change.
- **The tool contract.** Every tool lives in `src/tools/<name>.ts` and exports `<name>Schema` (a plain zod shape object, **not** a `z.object`) and `<name>Tool` (an `async (args) => { content: [...] }` handler). The handler does nothing but call `stophyFetch("/<path>", args)` and JSON-stringify the result; the Stophy API owns the real work. It is registered in `src/server.ts` via `server.tool(name, description, schema, readOnly, wrap(handler))`.
- **Tool naming & descriptions.** Tools are named `stophy_<verb>_<noun>` (e.g. `stophy_search_videos`, `stophy_get_video`). The `description` string is the only thing a model uses to pick the tool: state what it does and when to reach for it (and when to use a sibling tool instead). Keep descriptions in sync with the README's tool reference.
- **Endpoint-backed only.** A tool must map to a real `/v1` endpoint on the Stophy API. Do not add a tool for a capability the backend does not expose; `/home/haki/stophy/apps/server` is the source of truth for available endpoints.
- **Errors.** `wrap()` in `server.ts` turns a thrown `StophyError` into a readable text response (`Stophy error (CODE): message`); `readOnly` marks the tool non-destructive. Throw `StophyError` from the client layer, not from tool handlers.
- **Releases.** User-facing changes require a changeset (`bun run changeset`). Changesets opens the version PR from `main`; merging that PR updates `package.json` / `CHANGELOG.md` and triggers the publish workflow. Do not manually bump `package.json` for normal releases.
- **Secrets.** API keys are `st_xxx` tokens carried as `STOPHY_API_KEY` (stdio) or in the URL path (HTTP). Never log, print, or commit them.

## Current tools

Eight tools, registered in `src/server.ts`. Search costs 5 credits, video details cost 2, other data tools cost 1, and `stophy_get_credits` is free.

| Tool | API path | Purpose |
|------|----------|---------|
| `stophy_search_videos` | `/search` | Search YouTube for videos, channels, playlists, or Shorts. |
| `stophy_get_video` | `/video` | One video: details, transcript, comments/replies, or live chat. |
| `stophy_get_channel` | `/channel` | Browse a channel's videos, Shorts, playlists, or about page. |
| `stophy_get_playlist` | `/playlist` | Every video in a playlist. |
| `stophy_get_suggestions` | `/suggest` | YouTube autocomplete for a partial query. |
| `stophy_music` | `/music` | YouTube Music search, metadata, lyrics, albums, artists, and playlists. |
| `stophy_kids` | `/kids` | YouTube Kids search and video metadata. |
| `stophy_get_credits` | `/credits` | Remaining credit balance. Free. |

## Adding a tool

1. Create `src/tools/<name>.ts` exporting `<name>Schema` (zod shape) and `<name>Tool` (handler) following the contract above. Derive the shape from the real API request, not assumptions.
2. Import and register it in `src/server.ts` with `server.tool(name, description, schema, readOnly, wrap(handler))`, keeping the grouping consistent with the existing list.
3. Add a row to the "Available tools" table and a section to the "Tool reference" in `README.md`.
4. Add a changeset with `bun run changeset` unless the tool is internal or unreleased scaffolding.
5. Run `bun run check-types && bun run build`.

## Editing a tool

Edit `src/tools/<name>.ts` in place. If the tool's behavior or arguments change, update the `description` in `src/server.ts` and the matching section in `README.md` in the same change. If the change is user-visible, add a changeset. Rebuild and type-check.

## Removing a tool

1. Delete `src/tools/<name>.ts`.
2. Remove its `server.tool(...)` registration and import from `src/server.ts`.
3. Drop its row and section from `README.md`.
4. Add a changeset; removing a tool is user-facing.
5. Run `bun run check-types && bun run build` to confirm nothing else imported it.

## The request path (`src/client.ts`)

`stophyFetch<T>(path, body?)` resolves the API key (`apiKeyStore.getStore() ?? process.env.STOPHY_API_KEY`), sends `Authorization: Bearer`, GETs when there's no body and POSTs JSON when there is, and validates the `{ success, data | error }` envelope. It throws `MISSING_API_KEY` when no key is present and `StophyError(status, code, message)` on a failed envelope. Add new request behavior here, not in tool handlers.

## Auth model

- **stdio** (`npx -y @stophy/mcp`): key comes from the `STOPHY_API_KEY` env var.
- **HTTP** (`src/http.ts`): key comes from the URL path (`/:apiKey/mcp`) and is carried per-request through `apiKeyStore` (AsyncLocalStorage), so a single process serves many keys safely.

## Changesets

Changesets owns release intent and version bumps.

- Add a changeset with `bun run changeset` for any user-facing tool, README, env var, or packaging change.
- Do not add a changeset for CI-only maintenance, comments, or internal refactors with no user-visible effect.
- The generated `.changeset/*.md` file must be committed with the change.
- On `main`, `version.yml` creates or updates the version PR via `changesets/action`.
- Merging the version PR runs `changeset version`, updates `package.json`, writes `CHANGELOG.md`, and removes consumed changeset files, which then triggers `publish.yml` (it runs on pushes to `main` that touch `package.json`).
- Do not hand-edit `CHANGELOG.md` for normal releases; edit the changeset text before the version PR is generated.

## Releasing & CI

- **`test.yml`**: on PR and push to `main`: Bun install (`--frozen-lockfile`), `check-types`, `build`. Keep it green before merging.
- **`version.yml`**: on push to `main`: opens/updates the Changesets version PR.
- **`publish.yml`**: on push to `main` touching `package.json` (or manual `workflow_dispatch`): builds with Bun, skips if the version already exists on npm, otherwise `npm publish --access public` (tag `beta` if the version contains `beta`, else `latest`), then syncs `server.json`'s version and publishes to the MCP registry via `mcp-publisher`.

Requirements:

- **No `NPM_TOKEN`.** npm publish uses [trusted publishing](https://docs.npmjs.com/trusted-publishers): the npm package must list this repo + `.github/workflows/publish.yml` as a trusted publisher on npmjs.com. npm then exchanges the workflow's OIDC token for short-lived credentials and attaches provenance automatically. Do not reintroduce `NPM_TOKEN` / `NODE_AUTH_TOKEN` for the normal publish path. (`bun publish` doesn't do the OIDC exchange yet, so the publish step uses the npm CLI; Bun is still used for the build.)
- `publish.yml` needs `id-token: write`, which powers both npm trusted publishing and the MCP registry's OIDC login. Keep it.
- `mcpName` in `package.json` and `name` in `server.json` must stay identical and in the `io.github.stophydotdev/*` namespace; the registry verifies npm ownership through this match. Keep `server.json`'s `packages[].identifier` equal to the npm package name (`@stophy/mcp`); the sync step matches on it.
- `bun.lock` is committed (the workflows install with `--frozen-lockfile`). Commit lockfile changes alongside dependency changes.

## package.json

`files` ships only `dist`. `bin.stophy-mcp` → `dist/index.js`. `prepare` runs the build. `version` is updated by Changesets, not by hand for normal releases. `mcpName` must equal `server.json`'s `name`. Keep the `description` aligned with the README tagline.

## Related

- `README.md`: human-facing connect instructions and per-tool reference.
- `server.json`: MCP registry manifest.
- `/home/haki/stophy/apps/server`: the Stophy API this server wraps (source of truth for endpoints).
- The skills repo (`stophydotdev/skills`) and CLI (`stophydotdev/cli`): sibling Stophy surfaces; keep tool names and arguments in line with the same API.
