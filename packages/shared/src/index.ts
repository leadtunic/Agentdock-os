export const AGENTDOCK_VERSION = '0.1.0';

export type EntityId = string;
export type ISODateString = string;

export type AgentRole =
  | 'frontend_engineer'
  | 'backend_engineer'
  | 'fullstack_engineer'
  | 'qa_engineer'
  | 'security_reviewer'
  | 'devops_engineer'
  | 'documentation_writer'
  | 'browser_operator'
  | 'product_analyst'
  | 'support_agent'
  | 'workflow_orchestrator';

export type TaskStatus =
  | 'draft'
  | 'created'
  | 'triaged'
  | 'in_progress'
  | 'patch_ready'
  | 'quality_gate_running'
  | 'quality_gate_failed'
  | 'waiting_approval'
  | 'approved'
  | 'rejected'
  | 'merged'
  | 'closed'
  | 'failed';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
