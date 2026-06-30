import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StophyError } from "./client.js";
import { channelSchema, channelTool } from "./tools/channel.js";
import { creditsTool } from "./tools/credits.js";
import { playlistSchema, playlistTool } from "./tools/playlist.js";
import { searchSchema, searchTool } from "./tools/search.js";
import { suggestSchema, suggestTool } from "./tools/suggest.js";
import { videoSchema, videoTool } from "./tools/video.js";

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

export function createServer(): McpServer {
	const server = new McpServer({
		name: "stophy",
		version: "1.0.0",
	});

	server.tool(
		"stophy_search_videos",
		"Search YouTube for videos, channels, playlists, or Shorts. Filter by upload date, duration, and sort order. Returns items with title, author, view count, duration, and publish date. Paginate with continuationToken. When you already have a video URL, use stophy_get_video instead.",
		searchSchema,
		readOnly,
		wrap(searchTool)
	);

	server.tool(
		"stophy_get_video",
		"Get YouTube data for a specific video. type=\"details\": title, description, stats, tags, and related videos. type=\"transcript\": timestamped captions with language info and speaker segments. type=\"comments\": threaded comments with author, likes, and reply count; pass a comment's repliesToken as continuationToken to fetch its replies. type=\"livechat\": real-time chat from a live stream. Poll with continuationToken every pollIntervalMs until it returns null (stream ended). Set chatType=\"top\" for moderated chat or \"live\" for all messages. When discovering videos, use stophy_search_videos instead.",
		videoSchema,
		readOnly,
		wrap(videoTool)
	);

	server.tool(
		"stophy_get_channel",
		"Browse a YouTube channel. Every tab returns channel info (name, handle, subscriber count, video count). tab=\"video\", \"short\", or \"playlist\" lists content with pagination. tab=\"about\" returns the full profile: country, join date, total views, and links. When you have a specific video URL, use stophy_get_video instead.",
		channelSchema,
		readOnly,
		wrap(channelTool)
	);

	server.tool(
		"stophy_get_playlist",
		"Get all videos in a YouTube playlist. Returns the playlist title, author, and every video. Paginate with continuationToken.",
		playlistSchema,
		readOnly,
		wrap(playlistTool)
	);

	server.tool(
		"stophy_get_suggestions",
		"YouTube autocomplete suggestions for a partial query. Returns an array of completions. Useful for topic discovery and query expansion.",
		suggestSchema,
		readOnly,
		wrap(suggestTool)
	);

	server.tool(
		"stophy_get_credits",
		"Check your Stophy credit balance. Free, does not cost a credit. Returns remaining credits.",
		{},
		readOnly,
		wrap(creditsTool)
	);

	return server;
}
