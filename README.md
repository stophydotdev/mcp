# @stophy/mcp

YouTube data for AI agents. Transcripts, comments, search, channels, playlists — all as structured JSON through the Model Context Protocol.

## How to connect

Two ways. Pick one.

### Option 1: hosted HTTP (zero install)

Give your MCP client this URL. Your API key goes in the path.

```
https://mcp.stophy.dev/$STOPHY_API_KEY/mcp
```

MCP client config:

```json
{
  "mcpServers": {
    "stophy": {
      "url": "https://mcp.stophy.dev/$STOPHY_API_KEY/mcp"
    }
  }
}
```

No install. No Node.js. Works anywhere that speaks HTTP MCP.

Get an API key at [stophy.dev/dashboard](https://stophy.dev/dashboard).

### Option 2: run it locally (stdio)

Your MCP client runs `@stophy/mcp` as a local process. The API key goes in the environment.

```bash
env STOPHY_API_KEY=$STOPHY_API_KEY npx -y @stophy/mcp
```

Or install it once:

```bash
npm install -g @stophy/mcp
env STOPHY_API_KEY=$STOPHY_API_KEY stophy-mcp
```

## Client configs

Pick your MCP client.

### Claude Desktop

File: `claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/`
- Windows: `%APPDATA%\Claude\`

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

If Claude Desktop says `spawn npx ENOENT`, Node.js is missing from PATH. Install the LTS from [nodejs.org](https://nodejs.org) and restart Claude Desktop completely.

### Claude Code

Stdio:

```bash
claude mcp add stophy -e STOPHY_API_KEY=$STOPHY_API_KEY -- npx -y @stophy/mcp
```

HTTP (if your Claude Code version supports remote MCP):

```bash
claude mcp add --transport http stophy https://mcp.stophy.dev/$STOPHY_API_KEY/mcp
```

### Cursor

File: `.cursor/mcp.json` (per project) or `~/.cursor/mcp.json` (global)

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

File: `~/.codeium/windsurf/mcp_config.json`

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

### Hermes Agent

Add to `config.yaml` under `mcp_servers`:

```yaml
mcp_servers:
  - name: stophy
    command: npx
    args: ["-y", "@stophy/mcp"]
    env:
      STOPHY_API_KEY: your_api_key_here
```

### Any other MCP client

If your client takes a command + args + env block, use the pattern above. If it takes a URL, use the hosted endpoint.

## Available tools

Six tools. Each call costs one credit except `stophy_get_credits` which is free.

| Tool | What it does |
|------|-------------|
| `stophy_search_videos` | Search YouTube by keyword. Returns videos, channels, playlists, or Shorts with pagination. |
| `stophy_get_video` | Get details, transcript, comments, comment replies, or live chat for one video. |
| `stophy_get_channel` | Browse a channel's videos, Shorts, playlists, or about page. |
| `stophy_get_playlist` | Fetch every video in a playlist. |
| `stophy_get_suggestions` | YouTube autocomplete for a partial query. |
| `stophy_get_credits` | Your remaining credit balance. Free. |

## Tool reference

### stophy_search_videos

Search YouTube. Use this to discover videos on a topic or find recent uploads. Not for fetching a specific video you already have the URL for — use `stophy_get_video` instead.

Arguments:
- `q` (required): what to search for
- `type`: `"video"`, `"short"`, `"channel"`, or `"playlist"`
- `uploadDate`: `"hour"`, `"today"`, `"week"`, `"month"`, or `"year"`
- `duration`: `"short"`, `"medium"`, or `"long"`
- `sortBy`: `"relevance"`, `"popularity"`, `"date"`, or `"rating"`
- `continuationToken`: token from previous response for the next page

```json
{
  "q": "typescript tutorial",
  "uploadDate": "week",
  "type": "video"
}
```

Returns `items[]` and an optional `continuationToken`.

### stophy_get_video

Get details, transcript, comments, comment replies, or live chat for a known video.

Arguments:
- `videoUrl` (required): YouTube video URL or ID
- `type` (required): `"details"`, `"transcript"`, `"comments"`, or `"livechat"`
- `sortBy`: `"top"` or `"latest"` for comments
- `chatType`: `"top"` or `"live"` for live chat
- `continuationToken`: next page of comments, or a comment's `repliesToken` for replies

Transcript:

```json
{
  "videoUrl": "https://youtube.com/watch?v=d56mG7DezGs",
  "type": "transcript"
}
```

Comments:

```json
{
  "videoUrl": "https://youtube.com/watch?v=d56mG7DezGs",
  "type": "comments",
  "sortBy": "top"
}
```

For comment replies, call again with `type: "comments"` and set `continuationToken` to the comment's `repliesToken`.

### stophy_get_channel

Browse a channel.

Arguments:
- `channelUrl` (required): channel URL, handle (@username), or channel ID
- `tab`: `"video"`, `"short"`, `"playlist"`, or `"about"` (default: `"video"`)
- `sortBy`: `"latest"`, `"popular"`, or `"oldest"` for the video tab
- `continuationToken`: next page

```json
{
  "channelUrl": "https://youtube.com/@t3dotgg",
  "tab": "video",
  "sortBy": "latest"
}
```

The `about` tab returns the channel's country, join date, view count, and links.

### stophy_get_playlist

All videos in a playlist.

Arguments:
- `playlistUrl` (required): playlist URL or ID
- `continuationToken`: next page

```json
{
  "playlistUrl": "https://youtube.com/playlist?list=PLTjRvDozrdlxEIuOBZkMAK5uiqp8rHUax"
}
```

### stophy_get_suggestions

YouTube autocomplete. Good for topic discovery and query expansion.

Arguments:
- `q` (required): partial query
- `hl`: language code, default `en`
- `gl`: region code, default `US`

```json
{
  "q": "react hooks",
  "hl": "en",
  "gl": "US"
}
```


## Pagination

Any tool that returns `continuationToken` supports pagination. Pass the token back with the same arguments to get the next page. A missing or null token means you've reached the end.

## Empty results

When a video has no transcript, comments are off, or a comment has no replies, Stophy returns an `empty` object:

```json
{
  "empty": {
    "code": "EMPTY_TRANSCRIPT_SEGMENTS",
    "message": "No transcript segments found."
  }
}
```

Possible codes: `EMPTY_TRANSCRIPT_SEGMENTS`, `EMPTY_COMMENTS`, `EMPTY_COMMENT_REPLIES`.

## Errors

Errors come back as text in the MCP tool response:

```
Stophy error (UNAUTHORIZED): Invalid API key.
```

```
Stophy error (MISSING_API_KEY): No Stophy API key provided. Set STOPHY_API_KEY (stdio) or include your key in the URL path (hosted). Get a key at https://stophy.dev/dashboard.
```

## Environment variables

| Variable | Required | What it is |
|----------|----------|-----------|
| `STOPHY_API_KEY` | Stdio only | Your Stophy API key. Not needed for hosted — the key is in the URL path. |
