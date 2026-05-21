import type { Command } from "commander";
import { api } from "../lib/api.js";
import { printSuccess, printError, printTable } from "../lib/output.js";

interface SkillResponse {
  id: string;
  name: string;
  skill_type: string;
  is_active: boolean;
}

export function skillCommands(program: Command): void {
  program
    .command("skill list")
    .description("List skills")
    .action(async () => {
      try {
        const skills = await api<SkillResponse[]>("get", "/skills");
        printTable(["ID", "Name", "Type", "Active"], skills.map((s) => [s.id.slice(0, 8), s.name, s.skill_type, s.is_active ? "yes" : "no"]));
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });

  program
    .command("skill create")
    .description("Create skill")
    .requiredOption("-n, --name <name>", "Skill name")
    .requiredOption("-d, --description <description>", "Skill description")
    .option("-t, --type <type>", "Skill type", "workflow")
    .action(async (opts) => {
      try {
        const skill = await api<SkillResponse>("post", "/skills", {
          name: opts.name,
          description: opts.description,
          skill_type: opts.type,
        });
        printSuccess(`Created skill: ${skill.name}`);
      } catch (err: unknown) {
        printError(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    });
}
