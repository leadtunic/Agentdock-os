import type { Command } from "commander";
import { api } from "../lib/api.js";
import { printSuccess, printError, printTable } from "../lib/output.js";

interface MemoryResponse {
  id: string;
  title: string;
  scope: string;
  memory_type: string;
}

export function memoryCommands(program: Command): void {
  program
    .command("memory list")
    .description("List memories")
    .option("-s, --scope <scope>", "Memory scope")
    .action(async (opts) => {
      try {
        const params = opts.scope ? `?scope=${opts.scope}` : "";
        const memories = await api<MemoryResponse[]>("get", `/memories${params}`);
        printTable(["ID", "Title", "Scope", "Type"], memories.map((m) => [m.id.slice(0, 8), m.title.slice(0, 40), m.scope, m.memory_type]));
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("memory create")
    .description("Create memory")
    .requiredOption("-t, --title <title>", "Memory title")
    .requiredOption("-c, --content <content>", "Memory content")
    .option("-s, --scope <scope>", "Scope", "project")
    .option("-p, --project <projectId>", "Project ID")
    .action(async (opts) => {
      try {
        const memory = await api<MemoryResponse>("post", "/memories", {
          title: opts.title,
          content: opts.content,
          scope: opts.scope,
          project_id: opts.project,
        });
        printSuccess(`Created memory: ${memory.title}`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("memory search")
    .description("Search memories")
    .requiredOption("-q, --query <query>", "Search query")
    .action(async (opts) => {
      try {
        const result = await api<{ memories: MemoryResponse[]; total: number }>("post", "/memories/search", { query: opts.query });
        printTable(["ID", "Title", "Scope", "Type"], result.memories.map((m) => [m.id.slice(0, 8), m.title.slice(0, 40), m.scope, m.memory_type]));
        console.log(`\nTotal: ${result.total}`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
}
