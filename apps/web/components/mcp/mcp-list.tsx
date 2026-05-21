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
import { Plus, MoreHorizontal } from 'lucide-react';

interface McpServer {
  id: string;
  name: string;
  url: string;
  transport: 'stdio' | 'sse' | 'http';
  tools_count: number;
  status: 'connected' | 'disconnected' | 'error';
}

interface McpListProps {
  servers?: McpServer[];
  onAdd?: () => void;
}

const mockServers: McpServer[] = [
  { id: '1', name: 'Filesystem Server', url: 'npx @modelcontextprotocol/server-filesystem', transport: 'stdio', tools_count: 8, status: 'connected' },
  { id: '2', name: 'GitHub Server', url: 'https://mcp.github.com/api', transport: 'sse', tools_count: 12, status: 'connected' },
  { id: '3', name: 'Slack Server', url: 'https://mcp.slack.com/api', transport: 'http', tools_count: 6, status: 'disconnected' },
  { id: '4', name: 'Database Server', url: 'npx @agentdock/db-server', transport: 'stdio', tools_count: 4, status: 'error' },
];

const statusVariant: Record<string, 'success' | 'secondary' | 'destructive'> = {
  connected: 'success',
  disconnected: 'secondary',
  error: 'destructive',
};

export function McpList({ servers = mockServers, onAdd }: McpListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">MCP Servers</CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Server
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">Name</TableHead>
              <TableHead className="text-dock-muted">URL / Command</TableHead>
              <TableHead className="text-dock-muted">Transport</TableHead>
              <TableHead className="text-dock-muted">Tools</TableHead>
              <TableHead className="text-dock-muted">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.id}>
                <TableCell className="font-medium text-white">{server.name}</TableCell>
                <TableCell className="font-mono text-sm text-dock-muted max-w-xs truncate">{server.url}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase">
                    {server.transport}
                  </Badge>
                </TableCell>
                <TableCell className="text-dock-muted">{server.tools_count}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[server.status] || 'secondary'}>{server.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Reconnect</DropdownMenuItem>
                      <DropdownMenuItem>View Tools</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Remove</DropdownMenuItem>
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
