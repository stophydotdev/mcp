import { z } from "zod";
import { stophyFetch } from "../client.js";

export const kidsSchema = {
	type: z.enum(["search", "video"]).describe("Kids resource to fetch"),
	q: z.string().optional().describe("YouTube Kids search query"),
	videoUrl: z
		.string()
		.optional()
		.describe("YouTube Kids, YouTube, or bare video ID to fetch"),
	continuationToken: z
		.string()
		.optional()
		.describe("Pagination token from a previous Kids search response"),
};

export async function kidsTool(args: z.infer<z.ZodObject<typeof kidsSchema>>) {
	const data = await stophyFetch("/kids", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
