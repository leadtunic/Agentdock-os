'use client';

import { ApprovalList } from '@/components/approvals/approval-list';

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <ApprovalList
        onApprove={(id) => console.log('Approve:', id)}
        onReject={(id) => console.log('Reject:', id)}
      />
    </div>
  );
}
