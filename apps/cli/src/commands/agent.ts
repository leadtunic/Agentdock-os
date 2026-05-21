import type { Command } from "commander";
import { api } from "../lib/api.js";
import { printSuccess, printError, printTable } from "../lib/output.js";

interface AgentResponse {
  id: string;
  name: string;
  role: string;
  model: string;
  status: string;
}

export function agentCommands(program: Command): void {
  program
    .command("agent list")
    .description("List agents")
    .option("-o, --org <orgId>", "Organization ID")
    .option("-p, --project <projectId>", "Project ID")
    .action(async (opts) => {
      try {
        const params = new URLSearchParams();
        if (opts.org) params.set("organization_id", opts.org);
        if (opts.project) params.set("project_id", opts.project);
        const agents = await api<AgentResponse[]>("get", `/agents?${params}`);
        printTable(["ID", "Name", "Role", "Model", "Status"], agents.map((a) => [a.id.slice(0, 8), a.name, a.role, a.model, a.status]));
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("agent create")
    .description("Create agent")
    .requiredOption("-n, --name <name>", "Agent name")
    .requiredOption("-r, --role <role>", "Agent role")
    .requiredOption("-o, --org <orgId>", "Organization ID")
    .option("-m, --model <model>", "Model name", "gpt-4o")
    .option("-p, --project <projectId>", "Project ID")
    .action(async (opts) => {
      try {
        const agent = await api<AgentResponse>("post", "/agents", {
          name: opts.name,
          role: opts.role,
          organization_id: opts.org,
          model: opts.model,
          project_id: opts.project,
        });
        printSuccess(`Created agent: ${agent.name} (${agent.role})`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
}
