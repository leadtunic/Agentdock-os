import { z } from 'zod';

export const AgentRoleSchema = z.enum([
  'frontend_engineer',
  'backend_engineer',
  'fullstack_engineer',
  'qa_engineer',
  'security_reviewer',
  'devops_engineer',
  'documentation_writer',
  'browser_operator',
  'product_analyst',
  'support_agent',
  'workflow_orchestrator'
]);

export const TaskCreateSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  source: z.enum(['dashboard', 'toolbar', 'gateway', 'api', 'cli']).default('dashboard'),
  context: z.record(z.unknown()).optional()
});

export const ToolCallSchema = z.object({
  toolName: z.string(),
  input: z.record(z.unknown()),
  requiresApproval: z.boolean().default(false)
});

export const ApprovalRequestSchema = z.object({
  taskId: z.string(),
  actionType: z.string(),
  summary: z.string(),
  payload: z.record(z.unknown())
});

export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;
export type ToolCallInput = z.infer<typeof ToolCallSchema>;
export type ApprovalRequestInput = z.infer<typeof ApprovalRequestSchema>;
