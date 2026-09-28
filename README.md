# Stophy MCP

Give your AI agent public web data: web search, YouTube, Reddit, TikTok, Instagram, LinkedIn, maps, shopping, jobs, real estate, finance, and more. Stophy has 161 endpoints across 41 sources, and your agent reaches all of them through three MCP tools.

## Connect to the hosted server

Most apps can connect to the hosted server directly. There is nothing to install.

| URL | How you connect | What your agent can use |
| --- | --- | --- |
| `https://api.stophy.dev/mcp` | No key | The free tools: web search, YouTube search, and YouTube transcripts |
| `https://api.stophy.dev/mcp` | `Authorization: Bearer <key>` header | Every endpoint |
| `https://api.stophy.dev/mcp-oauth` | Sign in with your browser | Every endpoint |

Get an API key at [stophy.dev/signup](https://stophy.dev/signup).

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

Add this to `.cursor/mcp.json`:

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

With `STOPHY_API_KEY` set, your agent can use every endpoint. Without it, your agent gets the free tools.

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
| `stophy_describe_endpoint` | Shows the input an endpoint takes and whether it has more pages |
| `stophy_call` | Runs an endpoint and returns markdown, or JSON when you ask for it |

Your agent usually searches, then describes, then calls. Each result says how many credits it used.

## More

- [Stophy docs](https://docs.stophy.dev)
- [Dashboard and API keys](https://stophy.dev/dashboard)

## License

MIT
