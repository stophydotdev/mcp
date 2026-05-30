import { stophyFetch } from "../client.js";

export async function creditsTool() {
	const data = await stophyFetch("/credits");
	return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
