export interface SandboxSession {
  id: string;
  status: SandboxStatus;
  workingDir: string;
  allowedPaths: string[];
  blockedCommands: string[];
  maxMemoryMb: number;
  maxCpuPercent: number;
  timeoutSeconds: number;
  createdAt: string;
  closedAt?: string;
  commandCount: number;
  fileAccessCount: number;
}

export type SandboxStatus = 'created' | 'running' | 'idle' | 'closed' | 'error';

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  timedOut: boolean;
  memoryUsedMb?: number;
}

export interface FileOperation {
  path: string;
  operation: 'read' | 'write' | 'list' | 'delete' | 'exists';
  allowed: boolean;
  reason?: string;
}

export interface SandboxConfig {
  workingDir: string;
  allowedPaths: string[];
  blockedCommands: string[];
  maxMemoryMb: number;
  maxCpuPercent: number;
  timeoutSeconds: number;
}

export interface CommandRequest {
  command: string;
  args?: string[];
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}
