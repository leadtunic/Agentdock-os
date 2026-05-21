import type { Command } from "commander";
import { api } from "../lib/api.js";
import { printSuccess, printError, printTable } from "../lib/output.js";

interface ProviderResponse {
  id: string;
  name: string;
  provider_type: string;
  is_active: boolean;
}

export function providerCommands(program: Command): void {
  program
    .command("provider list")
    .description("List providers")
    .action(async () => {
      try {
        const providers = await api<ProviderResponse[]>("get", "/providers");
        printTable(["ID", "Name", "Type", "Active"], providers.map((p) => [p.id.slice(0, 8), p.name, p.provider_type, p.is_active ? "yes" : "no"]));
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("provider create")
    .description("Add provider")
    .requiredOption("-n, --name <name>", "Provider name")
    .requiredOption("-t, --type <type>", "Provider type")
    .option("-k, --key <key>", "API key")
    .option("-u, --url <url>", "Base URL")
    .action(async (opts) => {
      try {
        const provider = await api<ProviderResponse>("post", "/providers", {
          name: opts.name,
          provider_type: opts.type,
          api_key: opts.key,
          base_url: opts.url,
        });
        printSuccess(`Added provider: ${provider.name}`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("provider test")
    .description("Test provider connection")
    .requiredOption("-i, --id <id>", "Provider ID")
    .action(async (opts) => {
      try {
        const result = await api<{ success: boolean; message: string }>("post", "/providers/test", { provider_id: opts.id });
        if (result.success) {
          printSuccess(result.message);
        } else {
          printError(result.message);
        }
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
}
