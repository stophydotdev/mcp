import { z } from "zod";
import { stophyFetch } from "../client.js";

export const musicSchema = {
	type: z
		.enum(["search", "suggest", "song", "lyrics", "album", "artist", "playlist"])
		.describe("Music resource to fetch"),
	q: z.string().optional().describe("Search or suggestion query"),
	searchType: z
		.enum([
			"song",
			"video",
			"album",
			"artist",
			"playlist",
			"podcast",
			"episode",
			"profile",
		])
		.optional()
		.describe("Music search result type. Used only for type=search"),
	videoUrl: z
		.string()
		.optional()
		.describe("YouTube or YouTube Music video URL or bare video ID"),
	albumUrl: z
		.string()
		.optional()
		.describe("YouTube Music album URL or bare MPRE/OLAK album ID"),
	artistUrl: z
		.string()
		.optional()
		.describe("YouTube Music artist URL or bare UC/MPAD artist ID"),
	playlistUrl: z
		.string()
		.optional()
		.describe("YouTube or YouTube Music playlist URL or bare playlist ID"),
	continuationToken: z
		.string()
		.optional()
		.describe("Pagination token from a previous music search or playlist response"),
};

export async function musicTool(args: z.infer<z.ZodObject<typeof musicSchema>>) {
	const data = await stophyFetch("/music", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
