# @stophy/mcp

## 2.0.0

### Major Changes

- 11ec036: The package now connects your app to the hosted Stophy MCP server.

  - Your agent can use every Stophy endpoint through three tools: `stophy_search_endpoints`, `stophy_describe_endpoint` and `stophy_call`.
  - `STOPHY_API_KEY` is optional. Without it, your agent gets the free endpoints: web search, YouTube search and YouTube transcripts.
  - The six YouTube-only tools are gone.
  - The mode that put your API key in a URL is gone. Connect to `https://api.stophy.dev/mcp` directly instead.
