'use client';

import { useState } from 'react';
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
import { Plus, Search } from 'lucide-react';

const orgSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
});

type OrgFormValues = z.infer<typeof orgSchema>;

const mockOrgs = [
  { id: '1', name: 'Acme Corp', slug: 'acme', description: 'Main organization', projects: 5, members: 12, created_at: 'Jan 15, 2024' },
  { id: '2', name: 'Dev Team', slug: 'dev-team', description: 'Development team org', projects: 3, members: 8, created_at: 'Feb 20, 2024' },
  { id: '3', name: 'QA Division', slug: 'qa-division', description: 'Quality assurance', projects: 2, members: 4, created_at: 'Mar 10, 2024' },
];

export default function OrganizationsPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
  });

  const filtered = mockOrgs.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.slug.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = async (data: OrgFormValues) => {
    console.log('Creating org:', data);
    setOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-white">Organizations</CardTitle>
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dock-muted" />
              <Input
                className="pl-9"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dock-muted">Name</TableHead>
                <TableHead className="text-dock-muted">Slug</TableHead>
                <TableHead className="text-dock-muted">Projects</TableHead>
                <TableHead className="text-dock-muted">Members</TableHead>
                <TableHead className="text-dock-muted">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{org.name}</p>
                      <p className="text-sm text-dock-muted">{org.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{org.slug}</Badge>
                  </TableCell>
                  <TableCell className="text-dock-muted">{org.projects}</TableCell>
                  <TableCell className="text-dock-muted">{org.members}</TableCell>
                  <TableCell className="text-dock-muted">{org.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Name</label>
              <Input {...register('name')} placeholder="Organization name" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Slug</label>
              <Input {...register('slug')} placeholder="org-slug" />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Description</label>
              <Input {...register('description')} placeholder="Optional description" />
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
