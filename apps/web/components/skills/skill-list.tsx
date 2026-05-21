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
import { Plus, MoreHorizontal, Play } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  is_active: boolean;
  usage_count: number;
}

interface SkillListProps {
  skills?: Skill[];
  onAdd?: () => void;
}

const mockSkills: Skill[] = [
  { id: '1', name: 'Code Review', description: 'Review code changes for quality and best practices', category: 'Development', version: '1.2.0', is_active: true, usage_count: 156 },
  { id: '2', name: 'Deploy Pipeline', description: 'Execute deployment pipeline with rollback support', category: 'DevOps', version: '2.0.1', is_active: true, usage_count: 89 },
  { id: '3', name: 'Test Suite Runner', description: 'Run unit, integration and e2e tests', category: 'Testing', version: '1.0.5', is_active: true, usage_count: 234 },
  { id: '4', name: 'Doc Generator', description: 'Generate documentation from source code', category: 'Documentation', version: '0.9.0', is_active: false, usage_count: 45 },
  { id: '5', name: 'Security Scanner', description: 'Scan code for vulnerabilities and secrets', category: 'Security', version: '1.1.0', is_active: true, usage_count: 78 },
];

export function SkillList({ skills = mockSkills, onAdd }: SkillListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Skills</CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
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
              <TableHead className="text-dock-muted">Usage</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-white">{skill.name}</p>
                    <p className="text-sm text-dock-muted">{skill.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{skill.category}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-dock-muted">{skill.version}</TableCell>
                <TableCell>
                  <Badge variant={skill.is_active ? 'success' : 'secondary'}>
                    {skill.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-dock-muted">{skill.usage_count}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Test Skill
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
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
