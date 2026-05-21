import type { Command } from "commander";
import { api } from "../lib/api.js";
import { printSuccess, printError, printTable } from "../lib/output.js";

interface ProjectResponse {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  status: string;
}

export function projectCommands(program: Command): void {
  program
    .command("project list")
    .description("List projects")
    .action(async () => {
      try {
        const projects = await api<ProjectResponse[]>("get", "/projects");
        printTable(["ID", "Name", "Slug", "Org", "Status"], projects.map((p) => [p.id.slice(0, 8), p.name, p.slug, p.organization_id.slice(0, 8), p.status]));
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("project create")
    .description("Create project")
    .requiredOption("-n, --name <name>", "Project name")
    .requiredOption("-s, --slug <slug>", "Project slug")
    .requiredOption("-o, --org <orgId>", "Organization ID")
    .action(async (opts) => {
      try {
        const project = await api<ProjectResponse>("post", "/projects", {
          name: opts.name,
          slug: opts.slug,
          organization_id: opts.org,
        });
        printSuccess(`Created project: ${project.name} (${project.slug})`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
}
