#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ToolListChangedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import packageJson from "../package.json" with { type: "json" };

const DEFAULT_URL = "https://api.stophy.dev/mcp";

const hostedUrl = (): URL => {
	const value = process.env["STOPHY_MCP_URL"] ?? DEFAULT_URL;
	try {
		return new URL(value);
	} catch {
		throw new Error(`STOPHY_MCP_URL is not a valid URL: ${value}`);
	}
};

const headers = (): Record<string, string> => {
	const key = process.env["STOPHY_API_KEY"]?.trim();
	return key ? { Authorization: `Bearer ${key}` } : {};
};

const connectHosted = async (url: URL): Promise<Client> => {
	const client = new Client({ name: "stophy-mcp", version: packageJson.version });
	const transport = new StreamableHTTPClientTransport(url, {
		requestInit: { headers: headers() },
	});
	await client.connect(transport);
	return client;
};

const main = async (): Promise<void> => {
	const url = hostedUrl();
	let hosted: Client;
	try {
		hosted = await connectHosted(url);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		const hint = /401|unauthorized/iu.test(reason)
			? " Check STOPHY_API_KEY, or unset it to use the free tools."
			: "";
		throw new Error(`Could not connect to Stophy at ${url.origin}: ${reason}.${hint}`);
	}

	const local = new Server(
		{ name: "stophy", version: packageJson.version },
		{
			capabilities: { tools: { listChanged: true } },
			instructions: hosted.getInstructions(),
		},
	);

	local.setRequestHandler(ListToolsRequestSchema, (request) => hosted.listTools(request.params));
	local.setRequestHandler(CallToolRequestSchema, (request) => hosted.callTool(request.params));
	hosted.setNotificationHandler(ToolListChangedNotificationSchema, () =>
		local.sendToolListChanged(),
	);

	local.onclose = () => {
		void hosted.close();
	};
	await local.connect(new StdioServerTransport());
};

main().catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exit(1);
});
