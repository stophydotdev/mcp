# Stophy MCP

[![smithery badge](https://smithery.ai/badge/stophy/mcp)](https://smithery.ai/servers/stophy/mcp)

Web scraping API for AI agents, as an MCP server. One API to search the web, read what people say, and look up products, places, jobs and homes. Pay only for answers. Your agent reaches every Stophy endpoint through three MCP tools.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=stophy&config=eyJ1cmwiOiJodHRwczovL21jcC5zdG9waHkuZGV2L21jcCJ9)

## Connect to the hosted server

Most apps can connect to the hosted server directly. There is nothing to install.

| URL | How you connect | What your agent can use |
| --- | --- | --- |
| `https://api.stophy.dev/mcp` | No key | The endpoints marked `keyless: true` in the [endpoint list](https://api.stophy.dev/v1/endpoints), within a free allowance |
| `https://api.stophy.dev/mcp` | `Authorization: Bearer <key>` header | Every endpoint |
| `https://mcp.stophy.dev/mcp` | Sign in with your browser | Every endpoint |

Get an API key at [stophy.dev/signup](https://stophy.dev/signup).

### Claude

In Claude on the web, Desktop or mobile, open [Customize > Connectors](https://claude.ai/customize/connectors), choose **Add custom connector**, and paste `https://mcp.stophy.dev/mcp`. Sign in when Claude asks.

### Claude Code

To sign in with your browser, add the server, then run `/mcp` and choose **Authenticate**:

```bash
claude mcp add --transport http stophy https://mcp.stophy.dev/mcp
```

To use an API key:

```bash
claude mcp add --transport http stophy https://api.stophy.dev/mcp --header "Authorization: Bearer <key>"
```

To start without a key:

```bash
claude mcp add --transport http stophy https://api.stophy.dev/mcp
```

### Codex

To use the key in your `STOPHY_API_KEY` environment variable:

```bash
codex mcp add stophy --url https://api.stophy.dev/mcp --bearer-token-env-var STOPHY_API_KEY
```

To sign in with your browser instead, add the sign-in URL, then log in:

```bash
codex mcp add stophy --url https://mcp.stophy.dev/mcp
codex mcp login stophy
```

### Cursor

Use the **Add to Cursor** button above to sign in with your browser, or add this to `.cursor/mcp.json` to use a key:

```json
{
  "mcpServers": {
    "stophy": {
      "url": "https://api.stophy.dev/mcp",
      "headers": { "Authorization": "Bearer <key>" }
    }
  }
}
```

To start without a key, leave out `headers`.

## Run it as a local server

Some apps can only start a local MCP server. For those, use this package. It runs on your computer and passes every request to the hosted server, so it always has the same tools.

```bash
npx -y @stophy/mcp
```

With `STOPHY_API_KEY` set, your agent can use every endpoint. Without it, your agent can use the endpoints that need no key, within a free allowance.

### Claude Desktop

Add this to `claude_desktop_config.json`, then restart Claude Desktop:

```json
{
  "mcpServers": {
    "stophy": {
      "command": "npx",
      "args": ["-y", "@stophy/mcp"],
      "env": { "STOPHY_API_KEY": "<key>" }
    }
  }
}
```

To start without a key, leave out `env`.

The package needs Node.js 18 or later.

| Variable | What it does |
| --- | --- |
| `STOPHY_API_KEY` | Your Stophy API key. Optional. |
| `STOPHY_MCP_URL` | The server to connect to. The default is `https://api.stophy.dev/mcp`. |

## Tools

| Tool | What it does |
| --- | --- |
| `stophy_search_endpoints` | Finds the endpoint for a task, with its cost |
| `stophy_describe_endpoint` | Shows the input an endpoint takes and what it returns |
| `stophy_call` | Runs an endpoint with `id`, `input` and optional `fields`, and returns JSON |

Your agent usually searches, then describes, then calls. Endpoint ids are camelCase, such as `googleSearch` or `youtubeSearch`. Lists come back as `results`, and `fields` keeps only the keys you name on each row. Each result says how many credits it used.

To point at one thing, send its link or its id, never both: `videoUrl` or `videoId`, `placeUrl` or `placeId`, `userUrl` or `username`. The endpoint description lists the pair.

One call returns one page from the site at the price shown for that endpoint. Most calls cost 1 credit, some cost 2, and long lists cost 1 credit per 10 results. Some list endpoints take `page` and return `page`: ask for the next number, and stop when `results` comes back empty. Others return a `cursor` when there is more: pass it back unchanged as `cursor` to get the next page.

## Network and credentials

- The hosted server lives at `https://mcp.stophy.dev/mcp` (sign in) and `https://api.stophy.dev/mcp` (no key or an API key). Your client sends requests only there.
- Credentials: browser sign-in handled by your MCP client, or an optional `STOPHY_API_KEY` that you set yourself. The local package also reads an optional `STOPHY_MCP_URL`.
- The plugin manifests (`.mcp.json`, `.grok-plugin/plugin.json`, `mcp.json`, `plugin.json`) only point at the hosted server. They run no code on your machine.
- No telemetry.

## More

- [Stophy docs](https://docs.stophy.dev)
- [Dashboard and API keys](https://stophy.dev/dashboard)

## License

MIT
