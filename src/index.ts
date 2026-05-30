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

const readOnly = { readOnlyHint: true, destructiveHint: false };

server.tool(
	"stophy_search_videos",
	"Search YouTube videos by keyword. Supports filtering by type (video/channel/playlist), upload date, duration, and sort order. Returns video IDs, titles, descriptions, thumbnails, view counts, and channel info. Best for: discovering videos on a topic, finding recent uploads, exploring a subject. Not recommended for: fetching a specific video you already have the URL for. Use stophy_get_video instead.",
	searchSchema,
	readOnly,
	wrap(searchTool)
);

server.tool(
	"stophy_get_video",
	"Get details, transcript, or threaded comments for a YouTube video. Set type=\"details\" for title/description/stats, type=\"transcript\" for timestamped captions, type=\"comments\" for comments with author, text, likes, and replies. Paginate comments with continuationToken. Best for: extracting content from a known video URL. Not recommended for: discovering videos. Use stophy_search_videos instead.",
	videoSchema,
	readOnly,
	wrap(videoTool)
);

server.tool(
	"stophy_get_channel",
	"Browse a YouTube channel's videos, shorts, playlists, or about page. Sort by latest, popular, or oldest. Paginate with continuationToken. Best for: auditing a creator's catalog, pulling all videos/shorts from a channel, reading channel description. Not recommended for: fetching a single known video. Use stophy_get_video instead.",
	channelSchema,
	readOnly,
	wrap(channelTool)
);

server.tool(
	"stophy_get_playlist",
	"Get all videos in a YouTube playlist with full metadata per item. Paginate with continuationToken. Best for: processing curated collections, course playlists, or a channel's uploads playlist.",
	playlistSchema,
	readOnly,
	wrap(playlistTool)
);

server.tool(
	"stophy_get_suggestions",
	"Get YouTube autocomplete suggestions for a partial search query. Supports language (hl) and country (gl) codes. Returns up to 10 suggestion strings. Best for: query expansion, topic discovery, and building search UIs.",
	suggestSchema,
	readOnly,
	wrap(suggestTool)
);

server.tool(
	"stophy_get_credits",
	"Check your remaining Stophy API credit balance. One credit is consumed per request. Use before running large batch jobs to confirm you have enough credits.",
	{},
	readOnly,
	wrap(creditsTool)
);

const transport = new StdioServerTransport();
await server.connect(transport);
