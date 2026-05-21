import type { SandboxSession, SandboxStatus, SandboxConfig } from '../types.js';
import { config } from '../config.js';

const sandboxes = new Map<string, SandboxSession>();

export function createSandbox(params?: Partial<SandboxConfig>): SandboxSession {
  const now = new Date().toISOString();
  const workingDir = params?.workingDir ?? `${config.sandboxWorkingDir}/${crypto.randomUUID()}`;

  const blockedCommands = params?.blockedCommands ?? config.blockedCommands.split(',');
  const allowedPaths = params?.allowedPaths ?? config.allowedPaths.split(',');

  const session: SandboxSession = {
    id: crypto.randomUUID(),
    status: 'created',
    workingDir,
    allowedPaths,
    blockedCommands,
    maxMemoryMb: params?.maxMemoryMb ?? config.maxMemoryMb,
    maxCpuPercent: params?.maxCpuPercent ?? config.maxCpuPercent,
    timeoutSeconds: params?.timeoutSeconds ?? config.defaultTimeoutSeconds,
    createdAt: now,
    commandCount: 0,
    fileAccessCount: 0,
  };

  sandboxes.set(session.id, session);
  return session;
}

export function getSandbox(id: string): SandboxSession | undefined {
  return sandboxes.get(id);
}

export function listSandboxes(filter?: { status?: SandboxStatus }): SandboxSession[] {
  let result = Array.from(sandboxes.values());
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateSandboxStatus(id: string, status: SandboxStatus): SandboxSession | undefined {
  const sandbox = sandboxes.get(id);
  if (!sandbox) return undefined;

  sandbox.status = status;
  if (status === 'closed') {
    sandbox.closedAt = new Date().toISOString();
  }
  return sandbox;
}

export function incrementCommandCount(id: string): SandboxSession | undefined {
  const sandbox = sandboxes.get(id);
  if (!sandbox) return undefined;
  sandbox.commandCount++;
  return sandbox;
}

export function incrementFileAccessCount(id: string): SandboxSession | undefined {
  const sandbox = sandboxes.get(id);
  if (!sandbox) return undefined;
  sandbox.fileAccessCount++;
  return sandbox;
}

export function closeSandbox(id: string): SandboxSession | undefined {
  const sandbox = sandboxes.get(id);
  if (!sandbox) return undefined;

  sandbox.status = 'closed';
  sandbox.closedAt = new Date().toISOString();
  return sandbox;
}

export function deleteSandbox(id: string): boolean {
  return sandboxes.delete(id);
}

export function getSandboxCount(): number {
  return sandboxes.size;
}

export function getActiveSandboxCount(): number {
  return Array.from(sandboxes.values()).filter((s) =>
    ['created', 'running', 'idle'].includes(s.status),
  ).length;
}
