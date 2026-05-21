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

interface Provider {
  id: string;
  name: string;
  type: string;
  models: string[];
  is_active: boolean;
}

interface ProviderListProps {
  providers?: Provider[];
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const mockProviders: Provider[] = [
  { id: '1', name: 'OpenAI', type: 'openai', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'], is_active: true },
  { id: '2', name: 'Anthropic', type: 'anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'], is_active: true },
  { id: '3', name: 'Google', type: 'google', models: ['gemini-pro', 'gemini-ultra'], is_active: false },
  { id: '4', name: 'Ollama Local', type: 'ollama', models: ['llama3', 'mistral', 'codellama'], is_active: true },
];

export function ProviderList({ providers = mockProviders, onAdd, onEdit, onDelete }: ProviderListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Providers</CardTitle>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-dock-muted">Name</TableHead>
              <TableHead className="text-dock-muted">Type</TableHead>
              <TableHead className="text-dock-muted">Models</TableHead>
              <TableHead className="text-dock-muted">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium text-white">{provider.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {provider.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.slice(0, 3).map((model) => (
                      <Badge key={model} variant="secondary" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                    {provider.models.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{provider.models.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={provider.is_active ? 'success' : 'secondary'}>
                    {provider.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onEdit?.(provider.id)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete?.(provider.id)} className="text-red-500">
                        Delete
                      </DropdownMenuItem>
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
