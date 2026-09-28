# @stophy/mcp

A local (stdio) MCP server for Stophy: public web data for AI agents. It has no tools of its own. It connects to the hosted Stophy MCP server at `https://api.stophy.dev/mcp` over Streamable HTTP and forwards `tools/list` and `tools/call` to it, so its tools always match the hosted server. It exists for MCP apps that can only start a local server. Written in TypeScript as an **ESM** package, built with `bun build` to `dist/`, published to npm as `@stophy/mcp` (run with `npx -y @stophy/mcp`) and listed in the MCP registry as `io.github.stophydotdev/mcp`.

The hosted server lives in the main Stophy repo (`apps/server/src/mcp`). Add or change tools there, not here.

## Layout

```
src/
  index.ts        # the whole bridge: connects to the hosted server, then serves stdio
.github/workflows/
  publish.yml     # tokenless npm publish via trusted publishing + MCP registry sync
  version.yml     # Changesets version PR on main
  test.yml        # type-check + build on PR and push to main
.changeset/
  config.json     # Changesets release config
  README.md       # local release workflow notes
server.json       # MCP registry manifest: the npm package and the hosted remotes
package.json      # name, version, bin, mcpName (must equal server.json "name")
smithery.yaml     # Smithery listing config
README.md         # how to connect, hosted server first
AGENTS.md         # this file
CLAUDE.md         # @AGENTS.md (cross-agent include)
```

## Conventions

- **Language and build.** TypeScript only, **ESM** (`"type": "module"`, `moduleResolution` = `bundler`). `bun build` bundles `src/index.ts` into `dist/index.js` (Node target, minified). The bin `stophy-mcp` points at `dist/index.js`. The package targets Node `>=18`. Never edit or commit `dist/`.
- **Imports.** Relative imports carry the `.js` extension. `verbatimModuleSyntax` is on, so use `import type` for type-only imports.
- **Dependencies.** The only runtime dependency is `@modelcontextprotocol/sdk`. Use its own `Client`, `StreamableHTTPClientTransport`, `Server`, and `StdioServerTransport`.
- **Auth.** `STOPHY_API_KEY`, when set, is sent as `Authorization: Bearer <key>`. Without it the bridge connects keyless and the hosted server offers only the free tools. Never log, print, or commit a key, and never put one in a URL.
- **`STOPHY_MCP_URL`** overrides the hosted URL, for testing against a local server.
- **Errors.** If the hosted server is unreachable or rejects the key, the bridge prints one line to stderr and exits with code 1.
- **Branches and commits.** Work on a new branch for each change. Use Conventional Commits: `<type>(<scope>): <summary>`.
- **Type safety.** Strict TypeScript. Run `bun run check-types && bun run build` after every change.

## Changesets

Changesets owns release intent and version bumps.

- Add a changeset with `bun run changeset` for any user-facing README, env var, or packaging change.
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

- `README.md`: how to connect.
- `server.json`: MCP registry manifest.
- The main Stophy repo, `apps/server/src/mcp`: the hosted MCP server and its tools.
- The CLI (`stophydotdev/cli`) and skills (`stophydotdev/skills`): other ways to use the same API.
