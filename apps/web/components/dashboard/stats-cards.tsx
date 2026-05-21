import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  totalAgents?: number;
  activeTasks?: number;
  pendingApprovals?: number;
  failedTasks?: number;
}

export function StatsCards({
  totalAgents = 12,
  activeTasks = 8,
  pendingApprovals = 3,
  failedTasks = 1,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Agents',
      value: totalAgents,
      icon: Bot,
      description: 'Configured agents',
    },
    {
      title: 'Active Tasks',
      value: activeTasks,
      icon: Clock,
      description: 'Currently running',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals,
      icon: AlertTriangle,
      description: 'Awaiting review',
    },
    {
      title: 'Completed Today',
      value: 24,
      icon: CheckCircle,
      description: 'Tasks finished',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dock-muted">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-dock-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-dock-muted">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
