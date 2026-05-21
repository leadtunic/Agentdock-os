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
import { Globe } from 'lucide-react';

const mockSessions = [
  { id: '1', url: 'https://app.example.com/dashboard', status: 'active', duration: '12m 34s', agent: 'Browser Agent', created: '5 min ago' },
  { id: '2', url: 'https://admin.example.com/settings', status: 'completed', duration: '8m 12s', agent: 'Test Agent', created: '30 min ago' },
  { id: '3', url: 'https://api.example.com/docs', status: 'error', duration: '2m 45s', agent: 'Docs Agent', created: '1 hour ago' },
];

const statusVariant: Record<string, 'success' | 'secondary' | 'destructive'> = {
  active: 'success',
  completed: 'secondary',
  error: 'destructive',
};

export default function SessionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Globe className="h-5 w-5" />
          Browser Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">URL</TableHead>
              <TableHead className="text-dock-muted">Agent</TableHead>
              <TableHead className="text-dock-muted">Status</TableHead>
              <TableHead className="text-dock-muted">Duration</TableHead>
              <TableHead className="text-dock-muted">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-mono text-sm text-white">{session.url}</TableCell>
                <TableCell className="text-dock-muted">{session.agent}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[session.status] || 'secondary'}>{session.status}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-dock-muted">{session.duration}</TableCell>
                <TableCell className="text-dock-muted">{session.created}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
