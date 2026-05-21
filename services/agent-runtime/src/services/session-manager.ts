import type { AgentSession, SessionStatus, AgentMessage, ToolCallRecord, TokenUsage, AuditLogEntry, CostRecord } from '../types.js';

const sessions = new Map<string, AgentSession>();
const auditLogs: AuditLogEntry[] = [];
const costRecords: CostRecord[] = [];

export function createSession(params: {
  id: string;
  agentId: string;
  taskId: string;
  model: string;
  provider: string;
}): AgentSession {
  const now = new Date().toISOString();
  const session: AgentSession = {
    id: params.id,
    agentId: params.agentId,
    taskId: params.taskId,
    status: 'created',
    model: params.model,
    provider: params.provider,
    createdAt: now,
    updatedAt: now,
    messages: [],
    toolCalls: [],
    costUsd: 0,
    tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  };
  sessions.set(session.id, session);
  addAuditLog(session.id, 'session_created', 'system', { agentId: params.agentId, taskId: params.taskId });
  return session;
}

export function getSession(id: string): AgentSession | undefined {
  return sessions.get(id);
}

export function listSessions(filter?: { agentId?: string; taskId?: string; status?: SessionStatus }): AgentSession[] {
  let result = Array.from(sessions.values());
  if (filter?.agentId) result = result.filter((s) => s.agentId === filter.agentId);
  if (filter?.taskId) result = result.filter((s) => s.taskId === filter.taskId);
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateSessionStatus(id: string, status: SessionStatus, error?: string): AgentSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  session.status = status;
  session.updatedAt = new Date().toISOString();

  if (status === 'running' && !session.startedAt) {
    session.startedAt = new Date().toISOString();
  }

  if (['completed', 'failed', 'cancelled'].includes(status)) {
    session.completedAt = new Date().toISOString();
    session.error = error;
  }

  addAuditLog(id, 'session_status_changed', 'system', { status, error });
  return session;
}

export function addMessage(sessionId: string, message: Omit<AgentMessage, 'id' | 'timestamp'>): AgentSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  const msg: AgentMessage = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  session.messages.push(msg);
  session.updatedAt = new Date().toISOString();
  return session;
}

export function addToolCall(sessionId: string, toolCall: Omit<ToolCallRecord, 'id' | 'status'>): AgentSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  const record: ToolCallRecord = {
    ...toolCall,
    id: crypto.randomUUID(),
    status: toolCall.requiresApproval ? 'pending' : 'approved',
  };
  session.toolCalls.push(record);
  session.updatedAt = new Date().toISOString();
  addAuditLog(sessionId, 'tool_call_created', 'system', { toolName: toolCall.toolName, requiresApproval: toolCall.requiresApproval });
  return session;
}

export function updateToolCall(sessionId: string, toolCallId: string, updates: Partial<ToolCallRecord>): AgentSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  const idx = session.toolCalls.findIndex((tc) => tc.id === toolCallId);
  if (idx === -1) return undefined;

  session.toolCalls[idx] = { ...session.toolCalls[idx]!, ...updates };
  session.updatedAt = new Date().toISOString();
  addAuditLog(sessionId, 'tool_call_updated', 'system', { toolCallId, updates });
  return session;
}

export function addTokenUsage(sessionId: string, usage: TokenUsage, costUsd: number): AgentSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  session.tokenUsage = {
    promptTokens: session.tokenUsage.promptTokens + usage.promptTokens,
    completionTokens: session.tokenUsage.completionTokens + usage.completionTokens,
    totalTokens: session.tokenUsage.totalTokens + usage.totalTokens,
  };
  session.costUsd += costUsd;
  session.updatedAt = new Date().toISOString();

  costRecords.push({
    sessionId,
    provider: session.provider,
    model: session.model,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    costUsd,
    timestamp: new Date().toISOString(),
  });

  return session;
}

export function getCostRecords(sessionId?: string): CostRecord[] {
  if (sessionId) return costRecords.filter((r) => r.sessionId === sessionId);
  return costRecords;
}

export function getAuditLogs(sessionId?: string): AuditLogEntry[] {
  if (sessionId) return auditLogs.filter((l) => l.sessionId === sessionId);
  return auditLogs;
}

export function getSessionCount(): number {
  return sessions.size;
}

export function getActiveSessionCount(): number {
  return Array.from(sessions.values()).filter((s) =>
    ['created', 'queued', 'running', 'waiting_for_approval', 'waiting_for_user'].includes(s.status),
  ).length;
}

function addAuditLog(sessionId: string, action: string, actor: string, details: Record<string, unknown>): void {
  auditLogs.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    sessionId,
    action,
    actor,
    details,
  });
}
