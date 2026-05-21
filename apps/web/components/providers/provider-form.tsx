'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const providerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  api_key: z.string().min(1, 'API key is required'),
  base_url: z.string().optional(),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

interface ProviderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProviderFormValues) => void;
  defaultValues?: Partial<ProviderFormValues>;
}

export function ProviderForm({ open, onOpenChange, onSubmit, defaultValues }: ProviderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      type: defaultValues?.type || '',
      api_key: defaultValues?.api_key || '',
      base_url: defaultValues?.base_url || '',
    },
  });

  const handleFormSubmit = async (data: ProviderFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{defaultValues ? 'Edit Provider' : 'Add Provider'}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Name</label>
            <Input {...register('name')} placeholder="Provider name" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Type</label>
            <Select value={watch('type')} onValueChange={(v) => setValue('type', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">API Key</label>
            <Input {...register('api_key')} type="password" placeholder="sk-..." />
            {errors.api_key && <p className="text-sm text-red-500">{errors.api_key.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Base URL (optional)</label>
            <Input {...register('base_url')} placeholder="https://api.example.com" />
            {errors.base_url && <p className="text-sm text-red-500">{errors.base_url.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : defaultValues ? 'Update' : 'Add Provider'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
