import { z } from "zod";
import { stophyFetch } from "../client.js";

export const channelSchema = {
	channelUrl: z
		.string()
		.describe("YouTube channel URL. Accepts youtube.com/@handle or youtube.com/channel/UCxxx"),
	tab: z
		.enum(["video", "short", "live", "playlist", "post", "community", "course", "about"])
		.optional()
		.describe("Which tab to fetch. Defaults to video"),
	sortBy: z
		.enum(["latest", "popular", "oldest"])
		.optional()
		.describe("Sort order for the video tab"),
	query: z.string().optional().describe("Search within the channel"),
	continuationToken: z
		.string()
		.optional()
		.describe("Pagination token from a previous channel response"),
};

export async function channelTool(args: z.infer<z.ZodObject<typeof channelSchema>>) {
	const data = await stophyFetch("/channel", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
