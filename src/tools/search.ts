import { z } from "zod";
import { stophyFetch } from "../client.js";

export const searchSchema = {
	q: z.string().describe("Search query"),
	type: z
		.enum(["video", "channel", "playlist", "short"])
		.optional()
		.describe("Filter by content type"),
	uploadDate: z
		.enum(["hour", "today", "week", "month", "year"])
		.optional()
		.describe("Filter by upload date"),
	duration: z
		.enum(["short", "medium", "long"])
		.optional()
		.describe("short = under 4 min, medium = 4–20 min, long = over 20 min"),
	sortBy: z
		.enum(["relevance", "popularity", "date", "rating"])
		.optional()
		.describe("Sort order. Defaults to relevance"),
	continuationToken: z
		.string()
		.optional()
		.describe("Pagination token from a previous search response"),
};

export async function searchTool(args: z.infer<z.ZodObject<typeof searchSchema>>) {
	const data = await stophyFetch("/search", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
