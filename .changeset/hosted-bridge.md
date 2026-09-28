---
"@stophy/mcp": major
---

The package now connects your MCP app to the hosted Stophy server at `https://api.stophy.dev/mcp`, so it has the same tools: 161 endpoints across web search, YouTube, Reddit, TikTok, maps, shopping, jobs, real estate, and more, through `stophy_search_endpoints`, `stophy_describe_endpoint`, and `stophy_call`. The six YouTube-only tools are gone. `STOPHY_API_KEY` is now optional: without it you get the free tools. The self-hosted HTTP mode with the key in the URL is removed. Connect to `https://api.stophy.dev/mcp` directly instead.
