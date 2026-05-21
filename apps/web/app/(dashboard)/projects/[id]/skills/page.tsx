'use client';

import { SkillList } from '@/components/skills/skill-list';

export default function SkillsPage() {
  return (
    <div className="space-y-6">
      <SkillList onAdd={() => console.log('Add skill')} />
    </div>
  );
}
