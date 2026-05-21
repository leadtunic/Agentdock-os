export interface AgentSession {
  id: string;
  agentId: string;
  taskId: string;
  status: SessionStatus;
  model: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  messages: AgentMessage[];
  toolCalls: ToolCallRecord[];
  costUsd: number;
  tokenUsage: TokenUsage;
  error?: string;
}

export type SessionStatus =
  | 'created'
  | 'queued'
  | 'running'
  | 'waiting_for_approval'
  | 'waiting_for_user'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AgentMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  timestamp: string;
}

export interface ToolCallRecord {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: string;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  requiresApproval: boolean;
  approvedBy?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  costUsd?: number;
  tokenUsage?: TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiresApproval: boolean;
}

export interface LLMRequest {
  model: string;
  messages: Array<{ role: string; content: string; tool_calls?: unknown[]; tool_call_id?: string }>;
  tools?: Array<{ type: string; function: { name: string; description: string; parameters: Record<string, unknown> } }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string | null; tool_calls?: Array<{ id: string; type: string; function: { name: string; arguments: string } }> };
    finish_reason: string | null;
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  costUsd?: number;
}

export interface CostRecord {
  sessionId: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  timestamp: string;
}
