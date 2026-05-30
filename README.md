# stophy-mcp

MCP server for the [Stophy API](https://stophy.dev) — search, extract, and analyze YouTube for AI agents.

## Tools

| Tool | Description |
|------|-------------|
| `stophy_search_videos` | Search YouTube by keyword with filters (type, date, duration, sort) |
| `stophy_get_video` | Get details, transcript, or comments for a video URL |
| `stophy_get_channel` | Browse a channel's videos, shorts, playlists, or about page |
| `stophy_get_playlist` | Fetch all videos in a playlist with full metadata |
| `stophy_get_suggestions` | Get autocomplete suggestions for a partial query |
| `stophy_get_credits` | Check your remaining API credit balance |

## Setup

Get an API key at [stophy.dev](https://stophy.dev).

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "stophy": {
      "command": "npx",
      "args": ["-y", "stophy-mcp"],
      "env": {
        "STOPHY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "stophy": {
      "command": "npx",
      "args": ["-y", "stophy-mcp"],
      "env": {
        "STOPHY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "stophy": {
      "command": "npx",
      "args": ["-y", "stophy-mcp"],
      "env": {
        "STOPHY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STOPHY_API_KEY` | Yes | Your Stophy API key |

## License

MIT
