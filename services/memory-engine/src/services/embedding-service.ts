import type { Memory, EmbeddingRecord } from '../types.js';
import { config } from '../config.js';

const embeddings = new Map<string, EmbeddingRecord>();

export async function generateEmbedding(text: string, model?: string): Promise<number[]> {
  const modelName = model ?? config.embeddingModel;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateSimpleEmbedding(text);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: modelName,
        dimensions: config.embeddingDimensions,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.warn('Embedding API error, falling back to simple embedding');
      return generateSimpleEmbedding(text);
    }

    const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
    return data.data[0]?.embedding ?? generateSimpleEmbedding(text);
  } catch {
    return generateSimpleEmbedding(text);
  }
}

export async function prepareEmbedding(memory: Memory): Promise<EmbeddingRecord> {
  const existing = embeddings.get(memory.id);
  if (existing) return existing;

  const embedding = await generateEmbedding(memory.content);

  const record: EmbeddingRecord = {
    memoryId: memory.id,
    embedding,
    model: config.embeddingModel,
    createdAt: new Date().toISOString(),
  };

  embeddings.set(memory.id, record);
  return record;
}

export async function prepareEmbeddings(memories: Memory[]): Promise<EmbeddingRecord[]> {
  const records: EmbeddingRecord[] = [];

  for (const memory of memories) {
    const record = await prepareEmbedding(memory);
    records.push(record);
  }

  return records;
}

export function getEmbedding(memoryId: string): EmbeddingRecord | undefined {
  return embeddings.get(memoryId);
}

export function getAllEmbeddings(): EmbeddingRecord[] {
  return Array.from(embeddings.values());
}

export function clearEmbeddings(): void {
  embeddings.clear();
}

export function getEmbeddingCount(): number {
  return embeddings.size;
}

function generateSimpleEmbedding(text: string): number[] {
  const dimensions = config.embeddingDimensions;
  const embedding = new Array(dimensions).fill(0);

  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;

  for (let i = 0; i < Math.min(words.length, 100); i++) {
    const word = words[i]!;
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash + word.charCodeAt(j)) | 0;
    }

    const index = Math.abs(hash) % dimensions;
    embedding[index] += 1 / wordCount;
  }

  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}
