import { z } from "zod";
import { stophyFetch } from "../client.js";

export const playlistSchema = {
	playlistId: z
		.string()
		.describe("YouTube playlist ID (the part after ?list= in the URL)"),
	continuationToken: z
		.string()
		.optional()
		.describe("Pagination token from a previous playlist response"),
};

export async function playlistTool(args: z.infer<z.ZodObject<typeof playlistSchema>>) {
	const data = await stophyFetch("/playlist", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
