'use client';

import { RepoList } from '@/components/repositories/repo-list';

export default function RepositoriesPage() {
  return (
    <div className="space-y-6">
      <RepoList
        onAdd={() => console.log('Add repository')}
        onSync={(id) => console.log('Sync repo:', id)}
      />
    </div>
  );
}
