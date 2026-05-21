import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { search, searchBySimilarity, getRecentMemories, getFrequentlyAccessedMemories } from '../services/memory-search.js';
import { prepareEmbeddings, cosineSimilarity, getEmbedding } from '../services/embedding-service.js';
import { getMemory, listMemories } from '../services/memory-store.js';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  try {
    const searchSchema = z.object({
      query: z.string().optional(),
      scope: z.string().optional(),
      type: z.enum(['fact', 'preference', 'context', 'skill', 'conversation', 'observation', 'instruction']).optional(),
      tags: z.array(z.string()).optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    });

    const parsed = searchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const result = search(parsed.data);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/recent', (req: Request, res: Response) => {
  try {
    const scope = typeof req.query.scope === 'string' ? req.query.scope : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : undefined;

    const memories = getRecentMemories({ scope, type: type as Parameters<typeof getRecentMemories>[0], limit });
    return res.json({ memories, total: memories.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/frequent', (req: Request, res: Response) => {
  try {
    const scope = typeof req.query.scope === 'string' ? req.query.scope : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : undefined;

    const memories = getFrequentlyAccessedMemories({ scope, limit });
    return res.json({ memories, total: memories.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/similarity', async (req: Request, res: Response) => {
  try {
    const similaritySchema = z.object({
      query: z.string().min(1),
      scope: z.string().optional(),
      limit: z.number().optional(),
    });

    const parsed = similaritySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const memories = searchBySimilarity(parsed.data.query, parsed.data.scope);
    const limit = parsed.data.limit ?? 10;

    return res.json({
      memories: memories.slice(0, limit),
      total: memories.length,
      query: parsed.data.query,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/embed', async (req: Request, res: Response) => {
  try {
    const embedSchema = z.object({
      memoryIds: z.array(z.string()),
    });

    const parsed = embedSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const memoriesToEmbed: Array<{ id: string; content: string; type: string; scope: string; tags: string[]; metadata: Record<string, unknown>; createdAt: string; updatedAt: string; accessCount: number }> = [];
    for (const id of parsed.data.memoryIds) {
      const memory = getMemory(id);
      if (memory) {
        memoriesToEmbed.push(memory);
      }
    }

    const records = await prepareEmbeddings(memoriesToEmbed);
    return res.json({ embeddings: records, count: records.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/compare', (req: Request, res: Response) => {
  try {
    const compareSchema = z.object({
      memoryId1: z.string(),
      memoryId2: z.string(),
    });

    const parsed = compareSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const emb1 = getEmbedding(parsed.data.memoryId1);
    const emb2 = getEmbedding(parsed.data.memoryId2);

    if (!emb1 || !emb2) {
      return res.status(404).json({ error: 'One or both embeddings not found. Generate embeddings first.' });
    }

    const similarity = cosineSimilarity(emb1.embedding, emb2.embedding);

    return res.json({
      memoryId1: parsed.data.memoryId1,
      memoryId2: parsed.data.memoryId2,
      similarity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
