import { apiKeyStore } from "./context.js";

const BASE = "https://api.stophy.dev/v1";

export class StophyError extends Error {
	constructor(
		public readonly status: number,
		public readonly code: string,
		message: string
	) {
		super(message);
		this.name = "StophyError";
	}
}

export async function stophyFetch<T>(
	path: string,
	body?: Record<string, unknown>
): Promise<T> {
	const apiKey = apiKeyStore.getStore() ?? process.env["STOPHY_API_KEY"];
	if (!apiKey) {
		throw new StophyError(
			0,
			"MISSING_API_KEY",
			"No Stophy API key provided. Set STOPHY_API_KEY (stdio) or include your key in the URL path (hosted). Get a key at https://stophy.dev/dashboard."
		);
	}

	const res = await fetch(`${BASE}${path}`, {
		method: body !== undefined ? "POST" : "GET",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			...(body !== undefined ? { "Content-Type": "application/json" } : {}),
		},
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	});

	const json = (await res.json()) as
		| { success: true; data: T; creditsRemaining: number; cacheState: string }
		| { success: false; error: string; code?: string };

	if (!json.success) {
		throw new StophyError(res.status, json.code ?? "API_ERROR", json.error);
	}

	return json.data;
}
