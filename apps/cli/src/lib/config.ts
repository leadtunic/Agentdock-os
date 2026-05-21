import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface CliConfig {
  apiUrl: string;
  token: string | null;
  defaultOrg: string | null;
  defaultProject: string | null;
}

const configPath = path.join(os.homedir(), ".agentdock", "config.json");

let cachedConfig: CliConfig | null = null;

export function getConfig(): CliConfig {
  if (cachedConfig) return cachedConfig;

  try {
    if (fs.existsSync(configPath)) {
      cachedConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch {
    // ignore
  }

  cachedConfig = {
    apiUrl: process.env.AGENTDOCK_API_URL || "http://localhost:8000",
    token: process.env.AGENTDOCK_TOKEN || null,
    defaultOrg: null,
    defaultProject: null,
  };

  return cachedConfig;
}

export function saveConfig(config: Partial<CliConfig>): void {
  const current = getConfig();
  const updated = { ...current, ...config };
  cachedConfig = updated;

  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));
}

export async function loadConfig(): Promise<CliConfig> {
  return getConfig();
}
