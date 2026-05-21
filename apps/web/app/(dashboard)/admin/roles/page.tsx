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
import { Plus, ShieldCheck } from 'lucide-react';

const roleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  permissions: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const mockRoles = [
  { id: '1', name: 'Admin', description: 'Full access to all features', users: 2, permissions: ['*'] },
  { id: '2', name: 'Developer', description: 'Can manage agents and tasks', users: 5, permissions: ['agents:*', 'tasks:*', 'projects:read'] },
  { id: '3', name: 'Viewer', description: 'Read-only access', users: 3, permissions: ['projects:read', 'tasks:read'] },
  { id: '4', name: 'Operator', description: 'Can run and manage tasks', users: 4, permissions: ['tasks:*', 'approvals:*'] },
];

export default function AdminRolesPage() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
  });

  const onSubmit = async (data: RoleFormValues) => {
    console.log('Creating role:', data);
    setOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-5 w-5" />
            Roles
          </CardTitle>
          <Button onClick={() => setOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dock-muted">Name</TableHead>
                <TableHead className="text-dock-muted">Description</TableHead>
                <TableHead className="text-dock-muted">Users</TableHead>
                <TableHead className="text-dock-muted">Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium text-white">{role.name}</TableCell>
                  <TableCell className="text-dock-muted">{role.description}</TableCell>
                  <TableCell className="text-dock-muted">{role.users}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm) => (
                        <Badge key={perm} variant="outline" className="font-mono text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Add Role</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Name</label>
              <Input {...register('name')} placeholder="Role name" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Description</label>
              <Input {...register('description')} placeholder="What can this role do?" />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Permissions (comma-separated)</label>
              <Input {...register('permissions')} placeholder="agents:*, tasks:read" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Add Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
