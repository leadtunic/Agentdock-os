export interface Memory {
  id: string;
  content: string;
  type: MemoryType;
  scope: string;
  tags: string[];
  metadata: Record<string, unknown>;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  accessCount: number;
}

export type MemoryType = 'fact' | 'preference' | 'context' | 'skill' | 'conversation' | 'observation' | 'instruction';

export interface MemoryQuery {
  scope?: string;
  type?: MemoryType;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  memories: Memory[];
  total: number;
  query: string;
}

export interface EmbeddingRecord {
  memoryId: string;
  embedding: number[];
  model: string;
  createdAt: string;
}
