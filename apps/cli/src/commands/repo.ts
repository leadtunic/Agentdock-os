import type { Command } from "commander";
import { api } from "../lib/api.js";
import { printSuccess, printError, printTable } from "../lib/output.js";

interface RepoResponse {
  id: string;
  name: string;
  provider: string;
  url: string;
  default_branch: string;
}

export function repoCommands(program: Command): void {
  program
    .command("repo list")
    .description("List repositories")
    .option("-p, --project <projectId>", "Project ID")
    .action(async (opts) => {
      try {
        const params = opts.project ? `?project_id=${opts.project}` : "";
        const repos = await api<RepoResponse[]>("get", `/repositories${params}`);
        printTable(["ID", "Name", "Provider", "Branch"], repos.map((r) => [r.id.slice(0, 8), r.name, r.provider, r.default_branch]));
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("repo create")
    .description("Add repository")
    .requiredOption("-n, --name <name>", "Repository name")
    .requiredOption("-u, --url <url>", "Repository URL")
    .requiredOption("-p, --project <projectId>", "Project ID")
    .option("-b, --branch <branch>", "Default branch", "main")
    .action(async (opts) => {
      try {
        const repo = await api<RepoResponse>("post", "/repositories", {
          name: opts.name,
          url: opts.url,
          project_id: opts.project,
          default_branch: opts.branch,
        });
        printSuccess(`Added repository: ${repo.name}`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
}
