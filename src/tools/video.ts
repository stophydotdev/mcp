import { z } from "zod";
import { stophyFetch } from "../client.js";

export const videoSchema = {
	videoId: z.string().describe("YouTube video ID (the part after ?v= in the URL)"),
	include: z
		.array(z.enum(["details", "transcript", "comments"]))
		.optional()
		.describe("Which parts to fetch. Defaults to all three"),
	commentsSortBy: z
		.enum(["top", "latest"])
		.optional()
		.describe("Sort order for comments. Defaults to top"),
};

export async function videoTool(args: z.infer<z.ZodObject<typeof videoSchema>>) {
	const data = await stophyFetch("/video", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
