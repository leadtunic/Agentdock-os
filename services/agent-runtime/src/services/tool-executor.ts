import type { ToolCallRecord, AuditLogEntry } from '../types.js';
import { addAuditLog } from './session-manager.js';

const auditLogs: AuditLogEntry[] = [];

export interface ToolExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  requiresApproval: boolean;
  governancePassed: boolean;
  costUsd?: number;
}

export async function executeToolCall(params: {
  sessionId: string;
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
  requiresApproval: boolean;
  governanceCheck: (toolName: string, input: Record<string, unknown>) => Promise<{ allowed: boolean; reason?: string }>;
  executor: (toolName: string, input: Record<string, unknown>) => Promise<{ output: string; costUsd?: number }>;
}): Promise<ToolExecutionResult> {
  const governanceStart = Date.now();

  const governanceResult = await params.governanceCheck(params.toolName, params.input);

  if (!governanceResult.allowed) {
    addAuditLogInternal(params.sessionId, 'tool_call_governance_denied', 'system', {
      toolCallId: params.toolCallId,
      toolName: params.toolName,
      reason: governanceResult.reason,
      governanceDurationMs: Date.now() - governanceStart,
    });

    return {
      success: false,
      requiresApproval: params.requiresApproval,
      governancePassed: false,
      error: governanceResult.reason ?? 'Governance check failed',
    };
  }

  if (params.requiresApproval) {
    addAuditLogInternal(params.sessionId, 'tool_call_waiting_approval', 'system', {
      toolCallId: params.toolCallId,
      toolName: params.toolName,
    });

    return {
      success: false,
      requiresApproval: true,
      governancePassed: true,
    };
  }

  try {
    const execStart = Date.now();
    const result = await params.executor(params.toolName, params.input);
    const execDuration = Date.now() - execStart;

    addAuditLogInternal(params.sessionId, 'tool_call_executed', 'system', {
      toolCallId: params.toolCallId,
      toolName: params.toolName,
      outputLength: result.output.length,
      durationMs: execDuration,
      costUsd: result.costUsd,
    });

    return {
      success: true,
      output: result.output,
      requiresApproval: false,
      governancePassed: true,
      costUsd: result.costUsd,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    addAuditLogInternal(params.sessionId, 'tool_call_failed', 'system', {
      toolCallId: params.toolCallId,
      toolName: params.toolName,
      error: message,
    });

    return {
      success: false,
      requiresApproval: false,
      governancePassed: true,
      error: message,
    };
  }
}

export async function executeApprovedToolCall(params: {
  sessionId: string;
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
  executor: (toolName: string, input: Record<string, unknown>) => Promise<{ output: string; costUsd?: number }>;
}): Promise<ToolExecutionResult> {
  try {
    const execStart = Date.now();
    const result = await params.executor(params.toolName, params.input);
    const execDuration = Date.now() - execStart;

    addAuditLogInternal(params.sessionId, 'tool_call_executed_approved', 'system', {
      toolCallId: params.toolCallId,
      toolName: params.toolName,
      outputLength: result.output.length,
      durationMs: execDuration,
      costUsd: result.costUsd,
    });

    return {
      success: true,
      output: result.output,
      requiresApproval: false,
      governancePassed: true,
      costUsd: result.costUsd,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    addAuditLogInternal(params.sessionId, 'tool_call_failed', 'system', {
      toolCallId: params.toolCallId,
      toolName: params.toolName,
      error: message,
    });

    return {
      success: false,
      requiresApproval: false,
      governancePassed: true,
      error: message,
    };
  }
}

export function getToolAuditLogs(sessionId?: string): AuditLogEntry[] {
  if (sessionId) return auditLogs.filter((l) => l.sessionId === sessionId);
  return auditLogs;
}

function addAuditLogInternal(sessionId: string, action: string, actor: string, details: Record<string, unknown>): void {
  auditLogs.push({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    sessionId,
    action,
    actor,
    details,
  });
}
