import type { Command } from "commander";
import { api } from "../lib/api.js";
import { saveConfig } from "../lib/config.js";
import { printSuccess, printError, printInfo, printTable } from "../lib/output.js";

interface UserResponse {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface TokenResponse {
  access_token: string;
  user: UserResponse;
}

export function authCommands(program: Command): void {
  program
    .command("auth login")
    .description("Login to AgentDock API")
    .requiredOption("-e, --email <email>", "Email address")
    .requiredOption("-p, --password <password>", "Password")
    .option("-u, --url <url>", "API URL")
    .action(async (opts) => {
      try {
        if (opts.url) {
          saveConfig({ apiUrl: opts.url });
        }
        const result = await api<TokenResponse>("post", "/auth/login", {
          email: opts.email,
          password: opts.password,
        });
        saveConfig({ token: result.access_token });
        printSuccess(`Logged in as ${result.user.email}`);
      } catch (err: unknown) {
        printError(`Login failed: ${err instanceof Error ? err.message : "unknown error"}`);
        process.exit(1);
      }
    });

  program
    .command("auth logout")
    .description("Logout from AgentDock API")
    .action(() => {
      saveConfig({ token: null });
      printSuccess("Logged out");
    });

  program
    .command("auth whoami")
    .description("Show current user")
    .action(async () => {
      try {
        const user = await api<UserResponse>("get", "/auth/me");
        printTable(["ID", "Name", "Email", "Status"], [[user.id, user.name, user.email, user.status]]);
      } catch {
        printError("Not authenticated. Run: agentdock auth login");
        process.exit(1);
      }
    });
}
