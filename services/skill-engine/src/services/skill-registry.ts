import type { Skill, SkillDefinition, SkillPermission, PermissionType, PermissionLevel, SkillStep } from '../types.js';

const skills = new Map<string, Skill>();
const versions = new Map<string, Skill[]>();

export function createSkill(params: SkillDefinition): Skill {
  const now = new Date().toISOString();
  const skill: Skill = {
    id: crypto.randomUUID(),
    name: params.name,
    description: params.description,
    version: params.version,
    instructions: params.instructions,
    steps: params.steps.map((step) => {
      const skillStep: SkillStep = {
        id: crypto.randomUUID(),
        name: step.name,
        description: step.description,
        action: step.action,
        parameters: step.parameters,
      };
      if (step.condition !== undefined) {
        skillStep.condition = step.condition;
      }
      if (step.timeout !== undefined) {
        skillStep.timeout = step.timeout;
      }
      if (step.retryCount !== undefined) {
        skillStep.retryCount = step.retryCount;
      }
      return skillStep;
    }),
    permissions: params.permissions.map((p) => ({
      type: p.type,
      resource: p.resource,
      level: p.level,
    })),
    tags: params.tags,
    agentIds: params.agentIds,
    active: true,
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };

  skills.set(skill.id, skill);

  const versionKey = `${skill.name}@${skill.version}`;
  if (!versions.has(versionKey)) {
    versions.set(versionKey, []);
  }
  versions.get(versionKey)!.push(skill);

  return skill;
}

export function getSkill(id: string): Skill | undefined {
  return skills.get(id);
}

export function getSkillByName(name: string, version?: string): Skill | undefined {
  const all = Array.from(skills.values()).filter((s) => s.name === name);
  if (version) {
    return all.find((s) => s.version === version);
  }
  return all.sort((a, b) => b.version.localeCompare(a.version))[0];
}

export function listSkills(filter?: {
  agentId?: string;
  active?: boolean;
  tags?: string[];
  name?: string;
}): Skill[] {
  let result = Array.from(skills.values());

  if (filter?.agentId) {
    result = result.filter((s) => s.agentIds.includes(filter.agentId!) || s.agentIds.length === 0);
  }

  if (filter?.active !== undefined) {
    result = result.filter((s) => s.active === filter.active);
  }

  if (filter?.tags && filter.tags.length > 0) {
    result = result.filter((s) => filter.tags!.some((tag) => s.tags.includes(tag)));
  }

  if (filter?.name) {
    result = result.filter((s) => s.name.toLowerCase().includes(filter.name!.toLowerCase()));
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function updateSkill(id: string, updates: Partial<Skill>): Skill | undefined {
  const skill = skills.get(id);
  if (!skill) return undefined;

  Object.assign(skill, updates);
  skill.updatedAt = new Date().toISOString();
  return skill;
}

export function deleteSkill(id: string): boolean {
  const skill = skills.get(id);
  if (!skill) return false;

  const versionKey = `${skill.name}@${skill.version}`;
  const versionSkills = versions.get(versionKey);
  if (versionSkills) {
    const idx = versionSkills.findIndex((s) => s.id === id);
    if (idx !== -1) {
      versionSkills.splice(idx, 1);
    }
    if (versionSkills.length === 0) {
      versions.delete(versionKey);
    }
  }

  return skills.delete(id);
}

export function toggleSkillActive(id: string): Skill | undefined {
  const skill = skills.get(id);
  if (!skill) return undefined;
  skill.active = !skill.active;
  skill.updatedAt = new Date().toISOString();
  return skill;
}

export function getSkillVersions(name: string): Skill[] {
  const allVersions: Skill[] = [];
  for (const [key, versionSkills] of versions) {
    if (key.startsWith(`${name}@`)) {
      allVersions.push(...versionSkills);
    }
  }
  return allVersions.sort((a, b) => b.version.localeCompare(a.version));
}

export function getSkillCount(): number {
  return skills.size;
}

export function getActiveSkillCount(): number {
  return Array.from(skills.values()).filter((s) => s.active).length;
}

export function hasPermission(skill: Skill, type: PermissionType, resource: string, level: PermissionLevel): boolean {
  return skill.permissions.some((p) => {
    const typeMatch = p.type === type;
    const resourceMatch = p.resource === resource || p.resource === '*';
    const levelMatch = p.level === level || p.level === 'full';
    return typeMatch && resourceMatch && levelMatch;
  });
}
