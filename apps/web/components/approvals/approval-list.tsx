'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X } from 'lucide-react';

interface Approval {
  id: string;
  task_name: string;
  agent_name: string;
  action: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  created_at: string;
}

interface ApprovalListProps {
  approvals?: Approval[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const mockApprovals: Approval[] = [
  { id: '1', task_name: 'Update dependencies', agent_name: 'Maintainer Agent', action: 'npm update all packages', status: 'pending', reason: 'Updates 12 packages including 3 major versions', created_at: '2 hours ago' },
  { id: '2', task_name: 'Deploy to production', agent_name: 'Deploy Bot', action: 'Push to production environment', status: 'pending', reason: 'Release v2.4.0 contains breaking changes', created_at: '3 hours ago' },
  { id: '3', task_name: 'Delete old branches', agent_name: 'Cleanup Agent', action: 'Delete 15 merged branches', status: 'pending', reason: 'Branches older than 30 days', created_at: '5 hours ago' },
];

const statusVariant: Record<string, 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

export function ApprovalList({ approvals = mockApprovals, onApprove, onReject }: ApprovalListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">Task</TableHead>
              <TableHead className="text-dock-muted">Agent</TableHead>
              <TableHead className="text-dock-muted">Action</TableHead>
              <TableHead className="text-dock-muted">Reason</TableHead>
              <TableHead className="text-dock-muted">Status</TableHead>
              <TableHead className="text-dock-muted">Created</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell className="font-medium text-white">{approval.task_name}</TableCell>
                <TableCell className="text-dock-muted">{approval.agent_name}</TableCell>
                <TableCell className="text-dock-muted max-w-xs truncate">{approval.action}</TableCell>
                <TableCell className="text-dock-muted max-w-xs truncate">{approval.reason}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[approval.status] || 'secondary'}>
                    {approval.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-dock-muted">{approval.created_at}</TableCell>
                <TableCell>
                  {approval.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-green-500 hover:text-green-400"
                        onClick={() => onApprove?.(approval.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-400"
                        onClick={() => onReject?.(approval.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
