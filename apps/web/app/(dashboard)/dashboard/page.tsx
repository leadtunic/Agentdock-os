import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentTasks } from '@/components/dashboard/recent-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Activity } from 'lucide-react';

const activeAgents = [
  { id: '1', name: 'Code Reviewer', status: 'active', tasks: 12 },
  { id: '2', name: 'Deploy Bot', status: 'active', tasks: 5 },
  { id: '3', name: 'Test Runner', status: 'error', tasks: 0 },
  { id: '4', name: 'Docs Generator', status: 'inactive', tasks: 0 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTasks />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bot className="h-5 w-5" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between rounded-lg border border-dock-border p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        agent.status === 'active'
                          ? 'bg-green-500'
                          : agent.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-dock-border'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-xs text-dock-muted">{agent.tasks} tasks</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      agent.status === 'active'
                        ? 'success'
                        : agent.status === 'error'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5" />
            System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-1">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = Math.random() * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-dock-border transition-colors hover:bg-white/20"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-dock-muted">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
