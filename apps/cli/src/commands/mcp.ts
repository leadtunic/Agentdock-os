import type { Command } from "commander";
import { api } from "../lib/api.js";
import { printSuccess, printError, printTable } from "../lib/output.js";

interface McpServerResponse {
  id: string;
  name: string;
  transport: string;
  status: string;
  enabled: boolean;
}

export function mcpCommands(program: Command): void {
  program
    .command("mcp list")
    .description("List MCP servers")
    .action(async () => {
      try {
        const servers = await api<McpServerResponse[]>("get", "/mcp/servers");
        printTable(["ID", "Name", "Transport", "Status", "Enabled"], servers.map((s) => [s.id.slice(0, 8), s.name, s.transport, s.status, s.enabled ? "yes" : "no"]));
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("mcp create")
    .description("Add MCP server")
    .requiredOption("-n, --name <name>", "Server name")
    .requiredOption("-t, --transport <transport>", "Transport type")
    .requiredOption("-c, --config <config>", "Config JSON")
    .action(async (opts) => {
      try {
        const server = await api<McpServerResponse>("post", "/mcp/servers", {
          name: opts.name,
          transport: opts.transport,
          config: JSON.parse(opts.config),
        });
        printSuccess(`Added MCP server: ${server.name}`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
}
