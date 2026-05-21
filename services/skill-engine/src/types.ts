export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  instructions: string;
  steps: SkillStep[];
  permissions: SkillPermission[];
  tags: string[];
  agentIds: string[];
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SkillStep {
  id: string;
  name: string;
  description: string;
  action: string;
  parameters: Record<string, unknown>;
  condition?: string;
  timeout?: number;
  retryCount?: number;
}

export interface SkillPermission {
  type: PermissionType;
  resource: string;
  level: PermissionLevel;
}

export type PermissionType = 'file' | 'command' | 'network' | 'tool' | 'memory' | 'browser';
export type PermissionLevel = 'read' | 'write' | 'execute' | 'full';

export interface SkillExecution {
  id: string;
  skillId: string;
  skillName: string;
  status: ExecutionStatus;
  currentStep?: number;
  totalSteps: number;
  results: StepResult[];
  startedAt: string;
  completedAt?: string;
  error?: string;
  agentId?: string;
  sessionId?: string;
}

export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface StepResult {
  stepId: string;
  stepName: string;
  status: 'completed' | 'failed' | 'skipped';
  output?: string;
  error?: string;
  durationMs: number;
  timestamp: string;
}

export interface SkillDefinition {
  name: string;
  description: string;
  version: string;
  instructions: string;
  steps: Array<{
    name: string;
    description: string;
    action: string;
    parameters: Record<string, unknown>;
    condition?: string;
    timeout?: number;
    retryCount?: number;
  }>;
  permissions: Array<{
    type: PermissionType;
    resource: string;
    level: PermissionLevel;
  }>;
  tags: string[];
  agentIds: string[];
}
