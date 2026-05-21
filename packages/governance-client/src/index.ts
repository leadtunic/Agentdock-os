export type GovernanceDecision = {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
};

export function deny(reason: string): GovernanceDecision {
  return { allowed: false, reason };
}

export function allow(): GovernanceDecision {
  return { allowed: true };
}
