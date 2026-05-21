'use client';

import { useState } from 'react';
import { ProviderList } from '@/components/providers/provider-list';
import { ProviderForm } from '@/components/providers/provider-form';

export default function ProvidersPage() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <ProviderList
        onAdd={() => setFormOpen(true)}
        onEdit={(id) => console.log('Edit provider:', id)}
        onDelete={(id) => console.log('Delete provider:', id)}
      />
      <ProviderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(data) => console.log('Create provider:', data)}
      />
    </div>
  );
}
