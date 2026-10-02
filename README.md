# Stophy MCP

[![smithery badge](https://smithery.ai/badge/stophy/mcp)](https://smithery.ai/servers/stophy/mcp)

Live web data as typed JSON for AI agents. Search, video, social, jobs, places, shopping, apps, property and ads behind one key, with a price shown before every call. You pay only for answers that come back. Your agent reaches every Stophy endpoint through three MCP tools.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=stophy&config=eyJ1cmwiOiJodHRwczovL2FwaS5zdG9waHkuZGV2L21jcC1vYXV0aCJ9)

## Connect to the hosted server

Most apps can connect to the hosted server directly. There is nothing to install.

| URL | How you connect | What your agent can use |
| --- | --- | --- |
| `https://api.stophy.dev/mcp` | No key | Web search only |
| `https://api.stophy.dev/mcp` | `Authorization: Bearer <key>` header | Every endpoint |
| `https://api.stophy.dev/mcp-oauth` | Sign in with your browser | Every endpoint |

Get an API key at [stophy.dev/signup](https://stophy.dev/signup).

### Claude

In Claude on the web, Desktop or mobile, open [Customize > Connectors](https://claude.ai/customize/connectors), choose **Add custom connector**, and paste `https://api.stophy.dev/mcp-oauth`. Sign in when Claude asks.

### Claude Code

To sign in with your browser, add the server, then run `/mcp` and choose **Authenticate**:

```bash
claude mcp add --transport http stophy https://api.stophy.dev/mcp-oauth
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
codex mcp add stophy --url https://api.stophy.dev/mcp-oauth
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

With `STOPHY_API_KEY` set, your agent can use every endpoint. Without it, your agent can use Google search only.

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

Your agent usually searches, then describes, then calls. Endpoint ids are camelCase, such as `webSearch` or `youtubeSearch`. Lists come back as `results`, and `fields` keeps only the keys you name on each row. Each result says how many credits it used. One call returns one page at the price shown for that endpoint, and `limit` on a list endpoint keeps at most that many rows from the page at the same price.

## More

- [Stophy docs](https://docs.stophy.dev)
- [Dashboard and API keys](https://stophy.dev/dashboard)

## License

MIT
