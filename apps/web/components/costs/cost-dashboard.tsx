'use client';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Bot, Clock } from 'lucide-react';

interface CostEntry {
  id: string;
  task_name: string;
  agent_name: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost: number;
  date: string;
}

interface CostSummary {
  total_cost: number;
  total_tasks: number;
  avg_cost_per_task: number;
  cost_change: number;
}

interface CostDashboardProps {
  summary?: CostSummary;
  entries?: CostEntry[];
}

const mockSummary: CostSummary = {
  total_cost: 127.45,
  total_tasks: 342,
  avg_cost_per_task: 0.37,
  cost_change: -12.5,
};

const mockEntries: CostEntry[] = [
  { id: '1', task_name: 'Code review PR #234', agent_name: 'Code Reviewer', model: 'gpt-4', tokens_in: 4500, tokens_out: 1200, cost: 0.42, date: 'Today' },
  { id: '2', task_name: 'Deploy staging', agent_name: 'Deploy Bot', model: 'claude-3-sonnet', tokens_in: 2100, tokens_out: 800, cost: 0.18, date: 'Today' },
  { id: '3', task_name: 'Generate docs', agent_name: 'Docs Agent', model: 'gpt-4', tokens_in: 8900, tokens_out: 3400, cost: 0.89, date: 'Yesterday' },
  { id: '4', task_name: 'Run tests', agent_name: 'Test Runner', model: 'gpt-3.5-turbo', tokens_in: 1200, tokens_out: 600, cost: 0.05, date: 'Yesterday' },
  { id: '5', task_name: 'Security scan', agent_name: 'Security Agent', model: 'claude-3-opus', tokens_in: 6700, tokens_out: 2100, cost: 1.24, date: '2 days ago' },
];

export function CostDashboard({ summary = mockSummary, entries = mockEntries }: CostDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dock-muted">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-dock-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${summary.total_cost.toFixed(2)}</div>
            <p className={`text-xs ${summary.cost_change < 0 ? 'text-green-500' : 'text-red-500'}`}>
              {summary.cost_change > 0 ? '+' : ''}{summary.cost_change}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dock-muted">Total Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-dock-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.total_tasks}</div>
            <p className="text-xs text-dock-muted">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dock-muted">Avg Cost / Task</CardTitle>
            <Bot className="h-4 w-4 text-dock-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${summary.avg_cost_per_task.toFixed(2)}</div>
            <p className="text-xs text-dock-muted">Per task average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dock-muted">Tokens Used</CardTitle>
            <Clock className="h-4 w-4 text-dock-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(entries.reduce((a, b) => a + b.tokens_in + b.tokens_out, 0) / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-dock-muted">Total tokens</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Costs</TabsTrigger>
          <TabsTrigger value="by-agent">By Agent</TabsTrigger>
          <TabsTrigger value="by-model">By Model</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-dock-muted">Task</TableHead>
                    <TableHead className="text-dock-muted">Agent</TableHead>
                    <TableHead className="text-dock-muted">Model</TableHead>
                    <TableHead className="text-dock-muted">Tokens In</TableHead>
                    <TableHead className="text-dock-muted">Tokens Out</TableHead>
                    <TableHead className="text-dock-muted">Cost</TableHead>
                    <TableHead className="text-dock-muted">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium text-white">{entry.task_name}</TableCell>
                      <TableCell className="text-dock-muted">{entry.agent_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.model}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-dock-muted">{entry.tokens_in.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-sm text-dock-muted">{entry.tokens_out.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-sm text-white">${entry.cost.toFixed(2)}</TableCell>
                      <TableCell className="text-dock-muted">{entry.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-agent">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-dock-muted">Agent</TableHead>
                    <TableHead className="text-dock-muted">Tasks</TableHead>
                    <TableHead className="text-dock-muted">Total Cost</TableHead>
                    <TableHead className="text-dock-muted">Avg Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'Code Reviewer', tasks: 89, cost: 45.20, avg: 0.51 },
                    { name: 'Deploy Bot', tasks: 67, cost: 28.90, avg: 0.43 },
                    { name: 'Docs Agent', tasks: 45, cost: 32.10, avg: 0.71 },
                    { name: 'Test Runner', tasks: 120, cost: 12.50, avg: 0.10 },
                    { name: 'Security Agent', tasks: 21, cost: 8.75, avg: 0.42 },
                  ].map((agent) => (
                    <TableRow key={agent.name}>
                      <TableCell className="font-medium text-white">{agent.name}</TableCell>
                      <TableCell className="text-dock-muted">{agent.tasks}</TableCell>
                      <TableCell className="font-mono text-sm text-white">${agent.cost.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-sm text-dock-muted">${agent.avg.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-model">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-dock-muted">Model</TableHead>
                    <TableHead className="text-dock-muted">Tasks</TableHead>
                    <TableHead className="text-dock-muted">Total Tokens</TableHead>
                    <TableHead className="text-dock-muted">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'gpt-4', tasks: 134, tokens: '890K', cost: 78.30 },
                    { name: 'claude-3-sonnet', tasks: 67, tokens: '456K', cost: 28.90 },
                    { name: 'gpt-3.5-turbo', tasks: 120, tokens: '234K', cost: 12.50 },
                    { name: 'claude-3-opus', tasks: 21, tokens: '178K', cost: 7.75 },
                  ].map((model) => (
                    <TableRow key={model.name}>
                      <TableCell className="font-medium text-white">{model.name}</TableCell>
                      <TableCell className="text-dock-muted">{model.tasks}</TableCell>
                      <TableCell className="font-mono text-sm text-dock-muted">{model.tokens}</TableCell>
                      <TableCell className="font-mono text-sm text-white">${model.cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
