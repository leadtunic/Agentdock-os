'use client';

import { MemoryList } from '@/components/memory/memory-list';

export default function MemoryPage() {
  return (
    <div className="space-y-6">
      <MemoryList onAdd={() => console.log('Add memory entry')} />
    </div>
  );
}
