'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, FolderKanban } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  organization_id: z.string().min(1, 'Organization is required'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const mockProjects = [
  { id: '1', name: 'AgentDock Core', description: 'Core platform services', organization: 'Acme Corp', agents: 4, tasks: 156, created_at: 'Jan 15, 2024' },
  { id: '2', name: 'Internal Tools', description: 'Internal automation tools', organization: 'Dev Team', agents: 2, tasks: 89, created_at: 'Feb 20, 2024' },
  { id: '3', name: 'CI/CD Pipeline', description: 'Automated deployment pipeline', organization: 'Acme Corp', agents: 3, tasks: 234, created_at: 'Mar 10, 2024' },
];

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  const filtered = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = async (data: ProjectFormValues) => {
    console.log('Creating project:', data);
    setOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-white">Projects</CardTitle>
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dock-muted" />
              <Input
                className="pl-9"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dock-muted">Name</TableHead>
                <TableHead className="text-dock-muted">Organization</TableHead>
                <TableHead className="text-dock-muted">Agents</TableHead>
                <TableHead className="text-dock-muted">Tasks</TableHead>
                <TableHead className="text-dock-muted">Created</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-sm text-dock-muted">{project.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-dock-muted">{project.organization}</TableCell>
                  <TableCell className="text-dock-muted">{project.agents}</TableCell>
                  <TableCell className="text-dock-muted">{project.tasks}</TableCell>
                  <TableCell className="text-dock-muted">{project.created_at}</TableCell>
                  <TableCell>
                    <Link href={`/projects/${project.id}/overview`}>
                      <Button variant="ghost" size="icon">
                        <FolderKanban className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Name</label>
              <Input {...register('name')} placeholder="Project name" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Description</label>
              <Input {...register('description')} placeholder="Project description" />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Organization</label>
              <Input {...register('organization_id')} placeholder="Organization ID" />
              {errors.organization_id && <p className="text-sm text-red-500">{errors.organization_id.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
