export type PluginType =
  | 'channel_plugin'
  | 'tool_plugin'
  | 'mcp_plugin'
  | 'provider_plugin'
  | 'quality_gate_plugin'
  | 'browser_plugin'
  | 'repository_plugin'
  | 'notification_plugin';

export type PluginManifest = {
  name: string;
  version: string;
  type: PluginType;
  permissions: string[];
  entrypoint: string;
};

export type ToolExecutionContext = {
  organizationId: string;
  projectId: string;
  taskId?: string;
  agentId?: string;
};

export type AgentDockTool<TInput = unknown, TOutput = unknown> = {
  name: string;
  description: string;
  permissions: string[];
  execute(input: TInput, context: ToolExecutionContext): Promise<TOutput>;
};
