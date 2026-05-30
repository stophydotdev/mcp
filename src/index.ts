#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StophyError } from "./client.js";
import { channelSchema, channelTool } from "./tools/channel.js";
import { creditsTool } from "./tools/credits.js";
import { playlistSchema, playlistTool } from "./tools/playlist.js";
import { searchSchema, searchTool } from "./tools/search.js";
import { suggestSchema, suggestTool } from "./tools/suggest.js";
import { videoSchema, videoTool } from "./tools/video.js";

const server = new McpServer({
	name: "stophy",
	version: "0.1.0",
});

type ToolHandler<T> = (args: T) => Promise<{
	content: { type: "text"; text: string }[];
}>;

function wrap<T>(fn: ToolHandler<T>): ToolHandler<T> {
	return async (args) => {
		try {
			return await fn(args);
		} catch (err) {
			const message =
				err instanceof StophyError
					? `Stophy error (${err.code}): ${err.message}`
					: `Unexpected error: ${String(err)}`;
			return {
				content: [{ type: "text", text: message }],
			};
		}
	};
}

server.tool(
	"search_videos",
	"Search YouTube videos by keyword. Supports filtering by type, upload date, duration, and sort order. Returns video IDs, titles, descriptions, thumbnails, view counts, and channel info.",
	searchSchema,
	wrap(searchTool)
);

server.tool(
	"get_video",
	"Get details, transcript, and comments for a YouTube video. Transcript includes per-segment timestamps. Comments include author, text, likes, and replies.",
	videoSchema,
	wrap(videoTool)
);

server.tool(
	"get_channel",
	"Get a YouTube channel's videos, shorts, playlists, or about info. Supports sorting by latest, popular, or oldest. Use continuationToken to paginate through results.",
	channelSchema,
	wrap(channelTool)
);

server.tool(
	"get_playlist",
	"Get all videos in a YouTube playlist. Returns full video metadata per item. Use continuationToken to paginate.",
	playlistSchema,
	wrap(playlistTool)
);

server.tool(
	"get_suggestions",
	"Get YouTube autocomplete suggestions for a partial query. Useful for query expansion and topic discovery.",
	suggestSchema,
	wrap(suggestTool)
);

server.tool(
	"get_credits",
	"Check your remaining Stophy API credit balance. One credit is consumed per request.",
	{},
	wrap(creditsTool)
);

const transport = new StdioServerTransport();
await server.connect(transport);
