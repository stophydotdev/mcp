import { z } from "zod";
import { stophyFetch } from "../client.js";

export const videoSchema = {
	videoUrl: z
		.string()
		.describe("YouTube video URL or ID (e.g. https://youtube.com/watch?v=VIDEO_ID)"),
	type: z
		.enum(["details", "transcript", "comments"])
		.describe(
			"What to fetch: details = title/description/stats, transcript = timestamped captions, comments = threaded comments"
		),
	sortBy: z
		.enum(["latest", "top"])
		.optional()
		.describe("Sort order for comments. Defaults to top"),
	continuationToken: z
		.string()
		.optional()
		.describe("Pagination token from a previous comments response"),
};

export async function videoTool(args: z.infer<z.ZodObject<typeof videoSchema>>) {
	const data = await stophyFetch("/video", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
