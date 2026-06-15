# @stophy/mcp

MCP server for Stophy's YouTube API.

Use it to search YouTube, get transcripts, read comments, inspect channels, fetch playlists, get suggestions, and check credits from any MCP-compatible client.

You can connect in two ways:

- **Hosted HTTP MCP**: no install; connect directly to Stophy's hosted MCP server.
- **Local stdio MCP**: run `@stophy/mcp` locally with your API key in the environment.

## Hosted HTTP MCP

Use the hosted endpoint when your MCP client supports remote HTTP servers:

```text
https://mcp.stophy.dev/$STOPHY_API_KEY/mcp
```

Example client config:

```json
{
  "mcpServers": {
    "stophy": {
      "url": "https://mcp.stophy.dev/$STOPHY_API_KEY/mcp"
    }
  }
}
```

Your API key is included in the URL path. Get a key from [stophy.dev/dashboard](https://stophy.dev/dashboard).

## Local stdio MCP

Use the local server when your MCP client expects a command instead of a remote URL.

```bash
env STOPHY_API_KEY=$STOPHY_API_KEY npx -y @stophy/mcp
```

Manual installation:

```bash
npm install -g @stophy/mcp
env STOPHY_API_KEY=$STOPHY_API_KEY stophy-mcp
```

## Client setup

### Claude Desktop

Config file locations:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "stophy": {
      "command": "npx",
      "args": ["-y", "@stophy/mcp"],
      "env": {
        "STOPHY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

If Claude Desktop shows `spawn npx ENOENT`, Node.js is not installed or is not in your PATH. Install the LTS release from [nodejs.org](https://nodejs.org), then fully restart Claude Desktop.

### Claude Code

Local stdio server:

```bash
claude mcp add stophy -e STOPHY_API_KEY=$STOPHY_API_KEY -- npx -y @stophy/mcp
```

Hosted HTTP server, if your Claude Code version supports remote HTTP MCP:

```bash
claude mcp add --transport http stophy https://mcp.stophy.dev/$STOPHY_API_KEY/mcp
```

### Cursor

Add this to `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "stophy": {
      "command": "npx",
      "args": ["-y", "@stophy/mcp"],
      "env": {
        "STOPHY_API_KEY": "$STOPHY_API_KEY"
      }
    }
  }
}
```

### Windsurf

Add this to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "stophy": {
      "command": "npx",
      "args": ["-y", "@stophy/mcp"],
      "env": {
        "STOPHY_API_KEY": "$STOPHY_API_KEY"
      }
    }
  }
}
```

## Tools

| Tool | What it does |
|------|-------------|
| `stophy_search_videos` | Search YouTube by keyword with optional filters |
| `stophy_get_video` | Get video details, transcript, comments, or comment replies |
| `stophy_get_channel` | Browse a channel's videos, Shorts, playlists, or about page |
| `stophy_get_playlist` | Fetch videos in a playlist |
| `stophy_get_suggestions` | Get YouTube autocomplete suggestions |
| `stophy_get_credits` | Check remaining Stophy credits |

Each tool call costs one credit. `stophy_get_credits` is free.

## Tool reference

### `stophy_search_videos`

Search YouTube by keyword. Use this when you need to discover videos, channels, playlists, or Shorts for a topic.

Arguments:

- `q` (required): search query
- `type`: `"video"`, `"short"`, `"channel"`, or `"playlist"`
- `uploadDate`: `"hour"`, `"today"`, `"week"`, `"month"`, or `"year"`
- `duration`: `"short"`, `"medium"`, or `"long"`
- `sortBy`: `"relevance"`, `"popularity"`, `"date"`, or `"rating"`
- `continuationToken`: token from a previous response for the next page

Example:

```json
{
  "q": "typescript tutorial",
  "uploadDate": "week",
  "type": "video"
}
```

Returns search results with `items[]` and an optional `continuationToken`.

### `stophy_get_video`

Get details, transcript, comments, or replies for a known YouTube video.

Arguments:

- `videoUrl` (required): YouTube video URL or ID
- `type` (required): `"details"`, `"transcript"`, or `"comments"`
- `sortBy`: `"top"` or `"latest"` for comments
- `continuationToken`: next comments page, or a comment `repliesToken` to fetch replies

Transcript example:

```json
{
  "videoUrl": "https://youtube.com/watch?v=d56mG7DezGs",
  "type": "transcript"
}
```

Comments example:

```json
{
  "videoUrl": "https://youtube.com/watch?v=d56mG7DezGs",
  "type": "comments",
  "sortBy": "top"
}
```

To read replies, call `stophy_get_video` again with `type: "comments"` and set `continuationToken` to the comment's `repliesToken`.

### `stophy_get_channel`

Browse a channel's content or profile.

Arguments:

- `channelUrl` (required): channel URL, handle, or channel ID
- `tab`: `"video"`, `"short"`, `"playlist"`, or `"about"`; defaults to `"video"`
- `sortBy`: `"latest"`, `"popular"`, or `"oldest"` for the video tab
- `continuationToken`: token from a previous response for the next page

Example:

```json
{
  "channelUrl": "https://youtube.com/@t3dotgg",
  "tab": "video",
  "sortBy": "latest"
}
```

The `about` tab returns profile details such as country, joined date, view count, and links.

### `stophy_get_playlist`

Fetch videos from a playlist.

Arguments:

- `playlistUrl` (required): playlist URL or ID
- `continuationToken`: token from a previous response for the next page

Example:

```json
{
  "playlistUrl": "https://youtube.com/playlist?list=PLTjRvDozrdlxEIuOBZkMAK5uiqp8rHUax"
}
```

### `stophy_get_suggestions`

Get YouTube autocomplete suggestions for a partial query.

Arguments:

- `q` (required): partial query
- `hl`: language code, for example `en`; defaults to `en`
- `gl`: region code, for example `US`; defaults to `US`

Example:

```json
{
  "q": "react hooks",
  "hl": "en",
  "gl": "US"
}
```

### `stophy_get_credits`

Check your remaining credit balance. This tool does not consume a credit.

Example:

```json
{}
```

Returns:

```json
{
  "credits": 39152
}
```

## Pagination

Tools that return `continuationToken` can be paged. Pass the token back in the next call with the same arguments. When the token is missing or `null`, there is no next page.

## Empty results

If a video has no transcript, comments are turned off, or a comment has no replies, Stophy returns an `empty` object instead of items:

```json
{
  "empty": {
    "code": "EMPTY_TRANSCRIPT_SEGMENTS",
    "message": "No transcript segments found."
  }
}
```

Possible empty-result codes:

- `EMPTY_TRANSCRIPT_SEGMENTS`
- `EMPTY_COMMENTS`
- `EMPTY_COMMENT_REPLIES`

## Errors

Errors are returned as text in the MCP tool response:

```text
Stophy error (UNAUTHORIZED): Invalid API key.
```

```text
Stophy error (MISSING_API_KEY): No Stophy API key provided. Set STOPHY_API_KEY (stdio) or include your key in the URL path (hosted). Get a key at https://stophy.dev/dashboard.
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STOPHY_API_KEY` | Local stdio only | Your Stophy API key. Not needed for the hosted endpoint because the key is included in the URL path. |
