import { serve } from "@hono/node-server";
import type { HttpBindings } from "@hono/node-server";
import { RESPONSE_ALREADY_SENT } from "@hono/node-server/utils/response";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Hono } from "hono";
import { apiKeyStore } from "./context.js";
import { createServer } from "./server.js";

const app = new Hono<{ Bindings: HttpBindings }>();

app.get("/healthz", (c) => c.json({ ok: true }));

app.post("/:apiKey/mcp", async (c) => {
	const apiKey = c.req.param("apiKey");
	const body = await c.req.json();

	const server = createServer();
	const transport = new StreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
	});

	const { incoming, outgoing } = c.env;
	outgoing.on("close", () => {
		void transport.close();
		void server.close();
	});

	await server.connect(transport);
	await apiKeyStore.run(apiKey, () =>
		transport.handleRequest(incoming, outgoing, body)
	);

	return RESPONSE_ALREADY_SENT;
});

const port = Number(process.env["PORT"] ?? 8080);
serve({ fetch: app.fetch, port }, (info) => {
	console.error(`Stophy MCP HTTP server listening on :${info.port}`);
});
