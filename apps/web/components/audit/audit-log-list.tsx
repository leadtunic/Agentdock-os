'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  user: string;
  timestamp: string;
  details: string;
  severity: 'info' | 'warning' | 'error';
}

interface AuditLogListProps {
  entries?: AuditEntry[];
}

const mockEntries: AuditEntry[] = [
  { id: '1', action: 'agent.created', resource: 'agent:code-reviewer', user: 'admin@dock.io', timestamp: '2 min ago', details: 'Created agent with model gpt-4', severity: 'info' },
  { id: '2', action: 'task.started', resource: 'task:deploy-staging', user: 'deploy-bot', timestamp: '5 min ago', details: 'Task started by approval', severity: 'info' },
  { id: '3', action: 'approval.rejected', resource: 'approval:prod-deploy', user: 'admin@dock.io', timestamp: '15 min ago', details: 'Rejected: not ready for production', severity: 'warning' },
  { id: '4', action: 'provider.error', resource: 'provider:openai', user: 'system', timestamp: '30 min ago', details: 'Rate limit exceeded', severity: 'error' },
  { id: '5', action: 'user.login', resource: 'user:dev@dock.io', user: 'dev@dock.io', timestamp: '1 hour ago', details: 'Successful login from 192.168.1.1', severity: 'info' },
  { id: '6', action: 'skill.updated', resource: 'skill:deploy-pipeline', user: 'admin@dock.io', timestamp: '2 hours ago', details: 'Updated to version 2.0.1', severity: 'info' },
  { id: '7', action: 'task.failed', resource: 'task:test-suite', user: 'test-runner', timestamp: '3 hours ago', details: '3 tests failed in integration suite', severity: 'error' },
];

const severityVariant: Record<string, 'default' | 'warning' | 'destructive'> = {
  info: 'default',
  warning: 'warning',
  error: 'destructive',
};

export function AuditLogList({ entries = mockEntries }: AuditLogListProps) {
  const [search, setSearch] = useState('');

  const filtered = entries.filter(
    (entry) =>
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.resource.toLowerCase().includes(search.toLowerCase()) ||
      entry.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-white">Audit Log</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dock-muted" />
            <Input
              className="pl-9"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">Action</TableHead>
              <TableHead className="text-dock-muted">Resource</TableHead>
              <TableHead className="text-dock-muted">User</TableHead>
              <TableHead className="text-dock-muted">Severity</TableHead>
              <TableHead className="text-dock-muted">Details</TableHead>
              <TableHead className="text-dock-muted">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-sm text-white">{entry.action}</TableCell>
                <TableCell className="font-mono text-sm text-dock-muted">{entry.resource}</TableCell>
                <TableCell className="text-dock-muted">{entry.user}</TableCell>
                <TableCell>
                  <Badge variant={severityVariant[entry.severity] || 'secondary'}>{entry.severity}</Badge>
                </TableCell>
                <TableCell className="text-dock-muted max-w-xs truncate">{entry.details}</TableCell>
                <TableCell className="text-dock-muted">{entry.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
