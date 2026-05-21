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
import { Plus, MoreHorizontal, ExternalLink } from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  last_sync: string;
  status: 'synced' | 'error' | 'syncing';
}

interface RepoListProps {
  repositories?: Repository[];
  onAdd?: () => void;
  onSync?: (id: string) => void;
}

const mockRepos: Repository[] = [
  { id: '1', name: 'agentdock-os', url: 'https://github.com/agentdock/agentdock-os', branch: 'main', last_sync: '5 min ago', status: 'synced' },
  { id: '2', name: 'agent-templates', url: 'https://github.com/agentdock/templates', branch: 'develop', last_sync: '1 hour ago', status: 'synced' },
  { id: '3', name: 'internal-tools', url: 'https://github.com/agentdock/internal', branch: 'main', last_sync: '2 hours ago', status: 'error' },
];

const statusVariant: Record<string, 'success' | 'destructive' | 'default'> = {
  synced: 'success',
  error: 'destructive',
  syncing: 'default',
};

export function RepoList({ repositories = mockRepos, onAdd, onSync }: RepoListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Repositories</CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Repository
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">Name</TableHead>
              <TableHead className="text-dock-muted">URL</TableHead>
              <TableHead className="text-dock-muted">Branch</TableHead>
              <TableHead className="text-dock-muted">Status</TableHead>
              <TableHead className="text-dock-muted">Last Sync</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {repositories.map((repo) => (
              <TableRow key={repo.id}>
                <TableCell className="font-medium text-white">{repo.name}</TableCell>
                <TableCell>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-dock-muted hover:text-white">
                    <ExternalLink className="h-3 w-3" />
                    {repo.url}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{repo.branch}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[repo.status] || 'secondary'}>{repo.status}</Badge>
                </TableCell>
                <TableCell className="text-dock-muted">{repo.last_sync}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onSync?.(repo.id)}>Sync Now</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
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
