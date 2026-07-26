import { z } from "zod";
import { stophyFetch } from "../client.js";

export const suggestSchema = {
	q: z.string().describe("Partial query to get autocomplete suggestions for"),
	hl: z.string().optional().describe("Language code (e.g. en, fr). Defaults to en"),
	gl: z.string().optional().describe("Country code (e.g. US, GB). Defaults to US"),
};

export async function suggestTool(args: z.infer<z.ZodObject<typeof suggestSchema>>) {
	const data = await stophyFetch("/suggest", {
		q: args.q,
		hl: args.hl,
		gl: args.gl,
	});
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
