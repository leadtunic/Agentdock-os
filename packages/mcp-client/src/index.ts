export type McpServerConfig = {
  id: string;
  name: string;
  transport: 'stdio' | 'http' | 'sse';
  command?: string;
  url?: string;
  enabled: boolean;
};

export class McpRegistryClient {
  constructor(private readonly apiUrl: string) {}

  async listServers(): Promise<McpServerConfig[]> {
    const response = await fetch(`${this.apiUrl}/mcp/servers`);
    return response.json() as Promise<McpServerConfig[]>;
  }
}
