import type { Command } from "commander";
import http from "node:http";
import { printSuccess, printError, printInfo } from "../lib/output.js";
import { getConfig } from "../lib/config.js";

interface ServiceCheck {
  name: string;
  url: string;
}

export function doctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check system health")
    .action(async () => {
      const config = getConfig();
      const services: ServiceCheck[] = [
        { name: "API", url: `${config.apiUrl}/health` },
        { name: "Agent Runtime", url: `${process.env.AGENT_RUNTIME_URL || "http://localhost:8020"}/health` },
        { name: "Browser Runtime", url: `${process.env.BROWSER_RUNTIME_URL || "http://localhost:8010"}/health` },
        { name: "Gateway", url: `${process.env.GATEWAY_URL || "http://localhost:8030"}/health` },
      ];

      printInfo("AgentDock OS Doctor\n");

      for (const service of services) {
        try {
          const ok = await checkUrl(service.url);
          if (ok) {
            printSuccess(`${service.name}: healthy`);
          } else {
            printError(`${service.name}: unhealthy`);
          }
        } catch {
          printError(`${service.name}: unreachable`);
        }
      }

      if (!config.token) {
        printError("Not authenticated. Run: agentdock auth login");
      } else {
        printSuccess("Authenticated");
      }
    });
}

function checkUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 5000);
    http
      .get(url, (res) => {
        clearTimeout(timeout);
        resolve(res.statusCode === 200);
      })
      .on("error", () => {
        clearTimeout(timeout);
        resolve(false);
      });
  });
}
