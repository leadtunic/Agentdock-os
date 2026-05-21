import type { Command } from "commander";
import { api } from "../lib/api.js";
import { getConfig } from "../lib/config.js";
import { printSuccess, printError, printTable } from "../lib/output.js";

interface OrgResponse {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export function orgCommands(program: Command): void {
  program
    .command("org list")
    .description("List organizations")
    .action(async () => {
      try {
        const orgs = await api<OrgResponse[]>("get", "/organizations");
        printTable(["ID", "Name", "Slug", "Plan"], orgs.map((o) => [o.id.slice(0, 8), o.name, o.slug, o.plan]));
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("org create")
    .description("Create organization")
    .requiredOption("-n, --name <name>", "Organization name")
    .requiredOption("-s, --slug <slug>", "Organization slug")
    .action(async (opts) => {
      try {
        const org = await api<OrgResponse>("post", "/organizations", { name: opts.name, slug: opts.slug });
        printSuccess(`Created organization: ${org.name} (${org.slug})`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
}
