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
import { Plus } from 'lucide-react';

interface MemoryEntry {
  id: string;
  key: string;
  value: string;
  scope: 'project' | 'agent' | 'task';
  created_at: string;
  updated_at: string;
}

interface MemoryListProps {
  entries?: MemoryEntry[];
  onAdd?: () => void;
}

const mockEntries: MemoryEntry[] = [
  { id: '1', key: 'api_base_url', value: 'https://api.internal.service/v2', scope: 'project', created_at: '1 day ago', updated_at: '1 day ago' },
  { id: '2', key: 'auth_token', value: '***masked***', scope: 'agent', created_at: '2 days ago', updated_at: '5 hours ago' },
  { id: '3', key: 'db_connection_string', value: '***masked***', scope: 'project', created_at: '3 days ago', updated_at: '3 days ago' },
  { id: '4', key: 'last_deploy_hash', value: 'a1b2c3d', scope: 'task', created_at: '1 hour ago', updated_at: '1 hour ago' },
  { id: '5', key: 'feature_flags', value: '{"new_ui": true, "beta_api": false}', scope: 'project', created_at: '1 week ago', updated_at: '2 days ago' },
];

const scopeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  project: 'default',
  agent: 'secondary',
  task: 'outline',
};

export function MemoryList({ entries = mockEntries, onAdd }: MemoryListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Memory</CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">Key</TableHead>
              <TableHead className="text-dock-muted">Value</TableHead>
              <TableHead className="text-dock-muted">Scope</TableHead>
              <TableHead className="text-dock-muted">Created</TableHead>
              <TableHead className="text-dock-muted">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-sm text-white">{entry.key}</TableCell>
                <TableCell className="font-mono text-sm text-dock-muted max-w-xs truncate">{entry.value}</TableCell>
                <TableCell>
                  <Badge variant={scopeVariant[entry.scope] || 'secondary'} className="capitalize">
                    {entry.scope}
                  </Badge>
                </TableCell>
                <TableCell className="text-dock-muted">{entry.created_at}</TableCell>
                <TableCell className="text-dock-muted">{entry.updated_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
