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
import { Plus, Puzzle } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  is_enabled: boolean;
  category: string;
}

const mockPlugins: Plugin[] = [
  { id: '1', name: 'GitHub Integration', description: 'Connect to GitHub repositories and PRs', version: '1.2.0', is_enabled: true, category: 'Source Control' },
  { id: '2', name: 'Slack Notifications', description: 'Send task notifications to Slack channels', version: '1.0.3', is_enabled: true, category: 'Notifications' },
  { id: '3', name: 'Jira Sync', description: 'Sync tasks with Jira issues', version: '0.9.1', is_enabled: false, category: 'Project Management' },
  { id: '4', name: 'Sentry Integration', description: 'Report errors and performance metrics', version: '1.1.0', is_enabled: true, category: 'Monitoring' },
  { id: '5', name: 'Datadog Metrics', description: 'Export agent metrics to Datadog', version: '1.0.0', is_enabled: false, category: 'Monitoring' },
];

export default function PluginsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Puzzle className="h-5 w-5" />
            Plugins
          </CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Install Plugin
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dock-muted">Name</TableHead>
                <TableHead className="text-dock-muted">Category</TableHead>
                <TableHead className="text-dock-muted">Version</TableHead>
                <TableHead className="text-dock-muted">Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPlugins.map((plugin) => (
                <TableRow key={plugin.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{plugin.name}</p>
                      <p className="text-sm text-dock-muted">{plugin.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plugin.category}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-dock-muted">{plugin.version}</TableCell>
                  <TableCell>
                    <Badge variant={plugin.is_enabled ? 'success' : 'secondary'}>
                      {plugin.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      {plugin.is_enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
