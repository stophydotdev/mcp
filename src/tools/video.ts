import { z } from "zod";
import { stophyFetch } from "../client.js";

export const videoSchema = {
	videoUrl: z
		.string()
		.describe("YouTube video URL or ID (e.g. https://youtube.com/watch?v=VIDEO_ID)"),
	type: z
		.enum(["details", "transcript", "comments", "replies", "livechat"])
		.describe(
			"What to fetch: details = title/description/stats, transcript = timestamped captions, comments = threaded comments, livechat = live stream chat messages + status"
		),
	sortBy: z
		.enum(["latest", "top"])
		.optional()
		.describe("Sort order for comments. Defaults to top"),
	chatType: z
		.enum(["top", "live"])
		.optional()
		.describe(
			"For livechat only: 'top' = Top chat (moderated, default), 'live' = Live chat (all messages). Applied on the first call; later polls keep the chosen mode."
		),
	continuationToken: z
		.string()
		.optional()
		.describe(
			"Pagination token. For comments, pass a previous comments response token. For livechat, pass the continuationToken from a previous livechat response to poll for new messages."
		),
};

export async function videoTool(args: z.infer<z.ZodObject<typeof videoSchema>>) {
	const data = await stophyFetch("/video", args);
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
