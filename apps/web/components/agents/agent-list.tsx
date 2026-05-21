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
import { Plus, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  model: string;
  tasks_count: number;
}

interface AgentListProps {
  agents?: Agent[];
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const mockAgents: Agent[] = [
  { id: '1', name: 'Code Reviewer', description: 'Reviews pull requests and suggests improvements', status: 'active', model: 'gpt-4', tasks_count: 156 },
  { id: '2', name: 'Deploy Bot', description: 'Handles staging and production deployments', status: 'active', model: 'claude-3-sonnet', tasks_count: 89 },
  { id: '3', name: 'Test Runner', description: 'Executes test suites and reports results', status: 'error', model: 'gpt-4', tasks_count: 234 },
  { id: '4', name: 'Docs Generator', description: 'Generates API documentation from code', status: 'inactive', model: 'claude-3-haiku', tasks_count: 45 },
];

const statusVariant: Record<string, 'success' | 'secondary' | 'destructive'> = {
  active: 'success',
  inactive: 'secondary',
  error: 'destructive',
};

export function AgentList({ agents = mockAgents, onAdd, onEdit, onDelete }: AgentListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Agents</CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Agent
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">Name</TableHead>
              <TableHead className="text-dock-muted">Model</TableHead>
              <TableHead className="text-dock-muted">Status</TableHead>
              <TableHead className="text-dock-muted">Tasks</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-white">{agent.name}</p>
                    <p className="text-sm text-dock-muted">{agent.description}</p>
                  </div>
                </TableCell>
                <TableCell className="text-dock-muted">{agent.model}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[agent.status] || 'secondary'}>{agent.status}</Badge>
                </TableCell>
                <TableCell className="text-dock-muted">{agent.tasks_count}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onEdit?.(agent.id)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete?.(agent.id)} className="text-red-500">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
