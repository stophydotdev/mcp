import { z } from "zod";
import { stophyFetch } from "../client.js";

export const kidsSchema = {
	type: z.enum(["search", "video"]).describe("YouTube Kids resource to fetch"),
	q: z.string().optional().describe("Required for search"),
	videoUrl: z.string().optional().describe("Required for video"),
	continuationToken: z.string().optional().describe("Search pagination token"),
};

export async function kidsTool(args: z.infer<z.ZodObject<typeof kidsSchema>>) {
	const data = await stophyFetch("/kids", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
