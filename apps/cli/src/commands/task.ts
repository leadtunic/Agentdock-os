import type { Command } from "commander";
import { api } from "../lib/api.js";
import { printSuccess, printError, printTable } from "../lib/output.js";

interface TaskResponse {
  id: string;
  title: string;
  status: string;
  priority: string;
  agent_id: string | null;
}

export function taskCommands(program: Command): void {
  program
    .command("task list")
    .description("List tasks")
    .option("-p, --project <projectId>", "Project ID")
    .option("-s, --status <status>", "Filter by status")
    .action(async (opts) => {
      try {
        const params = new URLSearchParams();
        if (opts.project) params.set("project_id", opts.project);
        if (opts.status) params.set("status", opts.status);
        const tasks = await api<TaskResponse[]>("get", `/tasks?${params}`);
        printTable(["ID", "Title", "Status", "Priority", "Agent"], tasks.map((t) => [t.id.slice(0, 8), t.title.slice(0, 40), t.status, t.priority, t.agent_id?.slice(0, 8) || "-"]));
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("task create")
    .description("Create task")
    .requiredOption("-t, --title <title>", "Task title")
    .requiredOption("-d, --description <description>", "Task description")
    .option("-p, --project <projectId>", "Project ID")
    .option("-a, --agent <agentId>", "Agent ID")
    .option("--priority <priority>", "Priority", "normal")
    .action(async (opts) => {
      try {
        const task = await api<TaskResponse>("post", "/tasks", {
          title: opts.title,
          description: opts.description,
          project_id: opts.project,
          agent_id: opts.agent,
          priority: opts.priority,
        });
        printSuccess(`Created task: ${task.title}`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
}
