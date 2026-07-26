import { z } from "zod";
import { stophyFetch } from "../client.js";

export const musicSchema = {
	type: z
		.enum(["search", "suggest", "song", "lyrics", "album", "artist", "playlist"])
		.describe("YouTube Music resource to fetch"),
	q: z.string().optional().describe("Required for search and suggest"),
	searchType: z
		.enum(["song", "video", "album", "artist", "playlist", "podcast", "episode", "profile"])
		.optional()
		.describe("Result type for search. Defaults to song"),
	videoUrl: z.string().optional().describe("Required for song and lyrics"),
	albumUrl: z.string().optional().describe("Required for album"),
	artistUrl: z.string().optional().describe("Required for artist"),
	playlistUrl: z.string().optional().describe("Required for playlist"),
	continuationToken: z.string().optional().describe("Pagination token"),
};

export async function musicTool(args: z.infer<z.ZodObject<typeof musicSchema>>) {
	const data = await stophyFetch("/music", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
