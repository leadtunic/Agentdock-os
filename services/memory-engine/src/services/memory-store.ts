import type { Memory, MemoryType } from '../types.js';
import { config } from '../config.js';

const memories = new Map<string, Memory>();

export function createMemory(params: {
  id?: string;
  content: string;
  type: MemoryType;
  scope: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  expiresAt?: string;
}): Memory {
  const now = new Date().toISOString();
  const memory: Memory = {
    id: params.id ?? crypto.randomUUID(),
    content: params.content,
    type: params.type,
    scope: params.scope,
    tags: params.tags ?? [],
    metadata: params.metadata ?? {},
    createdAt: now,
    updatedAt: now,
    expiresAt: params.expiresAt,
    accessCount: 0,
  };

  const scopeMemories = getMemoriesByScope(params.scope);
  if (scopeMemories.length >= config.maxMemoriesPerScope) {
    const oldest = scopeMemories.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (oldest) {
      memories.delete(oldest.id);
    }
  }

  memories.set(memory.id, memory);
  return memory;
}

export function getMemory(id: string): Memory | undefined {
  const memory = memories.get(id);
  if (memory) {
    memory.accessCount++;
    memory.updatedAt = new Date().toISOString();
  }
  return memory;
}

export function updateMemory(id: string, updates: Partial<Memory>): Memory | undefined {
  const memory = memories.get(id);
  if (!memory) return undefined;

  Object.assign(memory, updates);
  memory.updatedAt = new Date().toISOString();
  return memory;
}

export function deleteMemory(id: string): boolean {
  return memories.delete(id);
}

export function listMemories(params?: {
  scope?: string;
  type?: MemoryType;
  tags?: string[];
  limit?: number;
  offset?: number;
}): Memory[] {
  let result = Array.from(memories.values());

  if (params?.scope) {
    result = result.filter((m) => m.scope === params.scope);
  }

  if (params?.type) {
    result = result.filter((m) => m.type === params.type);
  }

  if (params?.tags && params.tags.length > 0) {
    result = result.filter((m) => params.tags!.some((tag) => m.tags.includes(tag)));
  }

  result = result.filter((m) => !isExpired(m));

  result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const offset = params?.offset ?? 0;
  const limit = params?.limit ?? 50;
  return result.slice(offset, offset + limit);
}

export function getMemoriesByScope(scope: string): Memory[] {
  return Array.from(memories.values()).filter((m) => m.scope === scope && !isExpired(m));
}

export function getMemoriesByType(type: MemoryType): Memory[] {
  return Array.from(memories.values()).filter((m) => m.type === type && !isExpired(m));
}

export function getMemoriesByTags(tags: string[]): Memory[] {
  return Array.from(memories.values()).filter((m) => tags.some((tag) => m.tags.includes(tag)) && !isExpired(m));
}

export function searchMemories(query: string, params?: { scope?: string; type?: MemoryType }): Memory[] {
  const lowerQuery = query.toLowerCase();
  let result = Array.from(memories.values()).filter((m) => !isExpired(m));

  if (params?.scope) {
    result = result.filter((m) => m.scope === params.scope);
  }

  if (params?.type) {
    result = result.filter((m) => m.type === params.type);
  }

  result = result.filter((m) => {
    const contentMatch = m.content.toLowerCase().includes(lowerQuery);
    const tagMatch = m.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
    const metadataMatch = JSON.stringify(m.metadata).toLowerCase().includes(lowerQuery);
    return contentMatch || tagMatch || metadataMatch;
  });

  result.sort((a, b) => {
    const aContent = a.content.toLowerCase().includes(lowerQuery) ? 1 : 0;
    const bContent = b.content.toLowerCase().includes(lowerQuery) ? 1 : 0;
    if (aContent !== bContent) return bContent - aContent;
    return b.accessCount - a.accessCount;
  });

  return result.slice(0, 20);
}

export function getMemoryCount(): number {
  return memories.size;
}

export function getActiveMemoryCount(): number {
  return Array.from(memories.values()).filter((m) => !isExpired(m)).length;
}

export function cleanupExpiredMemories(): number {
  let count = 0;
  for (const [id, memory] of memories) {
    if (isExpired(memory)) {
      memories.delete(id);
      count++;
    }
  }
  return count;
}

function isExpired(memory: Memory): boolean {
  if (!memory.expiresAt) return false;
  return new Date(memory.expiresAt) < new Date();
}
