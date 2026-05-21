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
import Link from 'next/link';

interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval';
  agent_name: string;
  created_at: string;
}

interface RecentTasksProps {
  tasks?: Task[];
}

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'destructive' | 'warning'> = {
  pending: 'secondary',
  running: 'default',
  completed: 'success',
  failed: 'destructive',
  awaiting_approval: 'warning',
};

const mockTasks: Task[] = [
  { id: '1', name: 'Code review for PR #234', status: 'running', agent_name: 'Reviewer Agent', created_at: '2 min ago' },
  { id: '2', name: 'Deploy staging environment', status: 'completed', agent_name: 'Deploy Agent', created_at: '15 min ago' },
  { id: '3', name: 'Generate API documentation', status: 'pending', agent_name: 'Docs Agent', created_at: '30 min ago' },
  { id: '4', name: 'Run integration tests', status: 'failed', agent_name: 'Test Agent', created_at: '1 hour ago' },
  { id: '5', name: 'Update dependencies', status: 'awaiting_approval', agent_name: 'Maintainer Agent', created_at: '2 hours ago' },
];

export function RecentTasks({ tasks = mockTasks }: RecentTasksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">Task</TableHead>
              <TableHead className="text-dock-muted">Agent</TableHead>
              <TableHead className="text-dock-muted">Status</TableHead>
              <TableHead className="text-dock-muted">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium text-white">
                  <Link href={`/tasks/${task.id}`} className="hover:underline">
                    {task.name}
                  </Link>
                </TableCell>
                <TableCell className="text-dock-muted">{task.agent_name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[task.status] || 'secondary'}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-dock-muted">{task.created_at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
