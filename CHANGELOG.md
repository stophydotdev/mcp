# @stophy/mcp

## 2.0.5

### Patch Changes

- ee93d95: Agents now get Google search, News, Images, Shopping and AI Mode, AI answers, and LinkedIn people and company search. Without a key, Google search is the free tool.

## 2.0.4

### Patch Changes

- 45a306d: The README lists apps and shopping among the things your agent can use, and says each endpoint shows its price before you call it. The new App Store, Google Play, Indeed, Tripadvisor and Walmart endpoints appear through the same three tools with no update, and a transcript's price terms show in `stophy_describe_endpoint`.

## 2.0.3

### Patch Changes

- 0eb9e04: The description and README match the API we ship. Only web search works without a key.

## 2.0.2

### Patch Changes

- b333db0: The README now matches the current tools: `stophy_call` takes `id`, `input` and `fields` and returns JSON, ids are camelCase, and there is no feedback tool.

## 2.0.1

### Patch Changes

- 8fd4bc7: Update the package description and keywords, and add Cursor and Claude setup steps to the README.
- 3f2b2b5: Remove the obsolete Smithery config file. Stophy is now listed on Smithery through its hosted server.
- dd46af1: Sync the server.json description with the package description.

## 2.0.0

### Major Changes

- 11ec036: The package now connects your app to the hosted Stophy MCP server.

  - Your agent can use every Stophy endpoint through three tools: `stophy_search_endpoints`, `stophy_describe_endpoint` and `stophy_call`.
  - `STOPHY_API_KEY` is optional. Without it, your agent gets the free endpoints: web search, YouTube search and YouTube transcripts.
  - The six YouTube-only tools are gone.
  - The mode that put your API key in a URL is gone. Connect to `https://api.stophy.dev/mcp` directly instead.
