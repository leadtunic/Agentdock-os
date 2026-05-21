import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentTasks } from '@/components/dashboard/recent-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Terminal, Globe, Brain, Wrench, Plug, FolderKanban } from 'lucide-react';
import Link from 'next/link';

const projectModules = [
  { name: 'Agents', icon: Bot, href: 'agents', count: 4, description: 'Configured AI agents' },
  { name: 'Tasks', icon: Terminal, href: 'tasks', count: 156, description: 'Executed tasks' },
  { name: 'Sessions', icon: Globe, href: 'sessions', count: 23, description: 'Active sessions' },
  { name: 'Repositories', icon: FolderKanban, href: 'repositories', count: 3, description: 'Connected repos' },
  { name: 'Browser', icon: Globe, href: 'browser', count: 8, description: 'Browser sessions' },
  { name: 'Memory', icon: Brain, href: 'memory', count: 45, description: 'Memory entries' },
  { name: 'Skills', icon: Wrench, href: 'skills', count: 12, description: 'Available skills' },
  { name: 'MCP', icon: Plug, href: 'mcp', count: 5, description: 'MCP servers' },
];

export default function ProjectOverviewPage() {
  return (
    <div className="space-y-6">
      <StatsCards totalAgents={4} activeTasks={8} pendingApprovals={2} failedTasks={1} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projectModules.map((module) => (
          <Link key={module.name} href={module.href}>
            <Card className="transition-colors hover:border-dock-muted">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dock-bg">
                    <module.icon className="h-5 w-5 text-dock-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{module.name}</p>
                    <p className="text-xs text-dock-muted">{module.description}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant="secondary">{module.count}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <RecentTasks />
    </div>
  );
}
