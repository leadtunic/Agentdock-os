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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Play, Square } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval';
  agent_name: string;
  created_at: string;
  duration: string;
}

interface TaskListProps {
  tasks?: Task[];
  onAdd?: () => void;
  onRun?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const mockTasks: Task[] = [
  { id: '1', name: 'Code review for PR #234', description: 'Review changes in auth module', status: 'running', agent_name: 'Code Reviewer', created_at: '2 min ago', duration: '2m 15s' },
  { id: '2', name: 'Deploy staging', description: 'Deploy latest changes to staging', status: 'completed', agent_name: 'Deploy Bot', created_at: '15 min ago', duration: '4m 30s' },
  { id: '3', name: 'Run tests', description: 'Execute full test suite', status: 'pending', agent_name: 'Test Runner', created_at: '30 min ago', duration: '-' },
  { id: '4', name: 'Generate docs', description: 'Update API documentation', status: 'failed', agent_name: 'Docs Generator', created_at: '1 hour ago', duration: '1m 10s' },
  { id: '5', name: 'Update deps', description: 'Update all npm dependencies', status: 'awaiting_approval', agent_name: 'Maintainer', created_at: '2 hours ago', duration: '-' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'destructive' | 'warning'> = {
  pending: 'secondary',
  running: 'default',
  completed: 'success',
  failed: 'destructive',
  awaiting_approval: 'warning',
};

export function TaskList({ tasks = mockTasks, onAdd, onRun, onCancel }: TaskListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Tasks</CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">Task</TableHead>
              <TableHead className="text-dock-muted">Agent</TableHead>
              <TableHead className="text-dock-muted">Status</TableHead>
              <TableHead className="text-dock-muted">Duration</TableHead>
              <TableHead className="text-dock-muted">Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-white">{task.name}</p>
                    <p className="text-sm text-dock-muted">{task.description}</p>
                  </div>
                </TableCell>
                <TableCell className="text-dock-muted">{task.agent_name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[task.status] || 'secondary'}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-dock-muted font-mono text-sm">{task.duration}</TableCell>
                <TableCell className="text-dock-muted">{task.created_at}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {task.status === 'pending' && (
                        <DropdownMenuItem onClick={() => onRun?.(task.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Run
                        </DropdownMenuItem>
                      )}
                      {task.status === 'running' && (
                        <DropdownMenuItem onClick={() => onCancel?.(task.id)}>
                          <Square className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>View Details</DropdownMenuItem>
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
