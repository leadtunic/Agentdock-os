import { Command } from "commander";
import chalk from "chalk";
import { version } from "../package.json";
import { authCommands } from "./commands/auth.js";
import { orgCommands } from "./commands/org.js";
import { projectCommands } from "./commands/project.js";
import { agentCommands } from "./commands/agent.js";
import { taskCommands } from "./commands/task.js";
import { repoCommands } from "./commands/repo.js";
import { memoryCommands } from "./commands/memory.js";
import { skillCommands } from "./commands/skill.js";
import { mcpCommands } from "./commands/mcp.js";
import { providerCommands } from "./commands/provider.js";
import { doctorCommand } from "./commands/doctor.js";
import { loadConfig } from "./lib/config.js";

const program = new Command();

program
  .name("agentdock")
  .description("AgentDock OS CLI")
  .version(version);

program.hook("preAction", async () => {
  await loadConfig();
});

authCommands(program);
orgCommands(program);
projectCommands(program);
agentCommands(program);
taskCommands(program);
repoCommands(program);
memoryCommands(program);
skillCommands(program);
mcpCommands(program);
providerCommands(program);
doctorCommand(program);

program.addCommand(
  new Command("doctor").description("Check system health").action(doctorCommand),
);

program.parse();
