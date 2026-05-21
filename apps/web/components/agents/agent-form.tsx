'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';

const agentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  model: z.string().min(1, 'Model is required'),
  provider_id: z.string().min(1, 'Provider is required'),
});

type AgentFormValues = z.infer<typeof agentSchema>;

interface AgentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AgentFormValues) => void;
  defaultValues?: Partial<AgentFormValues>;
}

export function AgentForm({ open, onOpenChange, onSubmit, defaultValues }: AgentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      model: defaultValues?.model || '',
      provider_id: defaultValues?.provider_id || '',
    },
  });

  const selectedProvider = watch('provider_id');

  const handleFormSubmit = async (data: AgentFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{defaultValues ? 'Edit Agent' : 'Create Agent'}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Name</label>
            <Input {...register('name')} placeholder="Agent name" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Description</label>
            <Textarea {...register('description')} placeholder="What does this agent do?" />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Provider</label>
            <Select value={watch('provider_id')} onValueChange={(v) => setValue('provider_id', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
              </SelectContent>
            </Select>
            {errors.provider_id && <p className="text-sm text-red-500">{errors.provider_id.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Model</label>
            <Input {...register('model')} placeholder={selectedProvider ? 'e.g., gpt-4' : 'Select a provider first'} />
            {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : defaultValues ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
