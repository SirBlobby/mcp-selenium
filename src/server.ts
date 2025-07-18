#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { state } from './state.js';
import {
    registerBrowserActions,
    registerElementActions,
    registerInteractionActions,
    registerPageActions,
    registerWindowActions,
    registerCookieActions,
    registerXPathActions
} from './actions/index.js';


const server = new McpServer({
    name: "MCP Selenium",
    version: "1.0.3"
});

registerBrowserActions(server);
registerElementActions(server);
registerInteractionActions(server);
registerPageActions(server);
registerWindowActions(server);
registerCookieActions(server);
registerXPathActions(server);

console.log("MCP Selenium server initialized with all action modules loaded");

async function cleanup(): Promise<void> {
    console.log("Cleaning up browser sessions...");
    for (const [sessionId, driver] of state.drivers) {
        try {
            console.log(`Closing browser session: ${sessionId}`);
            await driver.quit();
        } catch (e: any) {
            console.error(`Error closing browser session ${sessionId}:`, e);
        }
    }
    state.drivers.clear();
    state.currentSession = null;
    console.log("All browser sessions closed");
    process.exit(0);
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

(async () => {
    const transport = new StdioServerTransport();
    console.log("Starting MCP Selenium server...");
    await server.connect(transport);
    console.log("MCP Selenium server connected and ready");
})().catch((error: any) => {
    console.error("Error starting MCP Selenium server:", error);
    process.exit(1);
});
