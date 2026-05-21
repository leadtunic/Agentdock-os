import type { Memory, MemoryType, SearchResult } from '../types.js';
import { listMemories, searchMemories, getMemoriesByScope, getMemoriesByTags } from './memory-store.js';

export interface SearchParams {
  query?: string;
  scope?: string;
  type?: MemoryType;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export function search(params: SearchParams): SearchResult {
  let memories: Memory[] = [];

  if (params.query) {
    memories = searchMemories(params.query, { scope: params.scope, type: params.type });
  } else {
    memories = listMemories({
      scope: params.scope,
      type: params.type,
      tags: params.tags,
      limit: params.limit,
      offset: params.offset,
    });
  }

  if (params.tags && params.tags.length > 0 && !params.query) {
    memories = getMemoriesByTags(params.tags);
  }

  if (params.scope && !params.query) {
    memories = getMemoriesByScope(params.scope);
  }

  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  const paginated = memories.slice(offset, offset + limit);

  return {
    memories: paginated,
    total: memories.length,
    query: params.query ?? '',
  };
}

export function searchBySimilarity(query: string, scope?: string): Memory[] {
  const results = searchMemories(query, scope ? { scope } : undefined);
  return results.slice(0, 10);
}

export function getRecentMemories(params?: { scope?: string; type?: MemoryType; limit?: number }): Memory[] {
  const memories = listMemories({
    scope: params?.scope,
    type: params?.type,
    limit: params?.limit ?? 20,
    offset: 0,
  });

  return memories.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getFrequentlyAccessedMemories(params?: { scope?: string; limit?: number }): Memory[] {
  const memories = listMemories({ scope: params?.scope, limit: params?.limit ?? 20 });
  return memories.sort((a, b) => b.accessCount - a.accessCount);
}
