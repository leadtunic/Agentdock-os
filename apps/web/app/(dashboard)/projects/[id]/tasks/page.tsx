'use client';

import { useState } from 'react';
import { TaskList } from '@/components/tasks/task-list';
import { TaskForm } from '@/components/tasks/task-form';

export default function TasksPage() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <TaskList
        onAdd={() => setFormOpen(true)}
        onRun={(id) => console.log('Run task:', id)}
        onCancel={(id) => console.log('Cancel task:', id)}
      />
      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(data) => console.log('Create task:', data)}
      />
    </div>
  );
}
