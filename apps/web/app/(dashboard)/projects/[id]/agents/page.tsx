'use client';

import { useState } from 'react';
import { AgentList } from '@/components/agents/agent-list';
import { AgentForm } from '@/components/agents/agent-form';

export default function AgentsPage() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AgentList
        onAdd={() => setFormOpen(true)}
        onEdit={(id) => console.log('Edit agent:', id)}
        onDelete={(id) => console.log('Delete agent:', id)}
      />
      <AgentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(data) => console.log('Create agent:', data)}
      />
    </div>
  );
}
