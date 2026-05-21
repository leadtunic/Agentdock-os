import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import type { MemoryType, Memory } from '../types.js';
import {
  createMemory,
  getMemory,
  updateMemory,
  deleteMemory,
  listMemories,
  getMemoryCount,
  cleanupExpiredMemories,
} from '../services/memory-store.js';
import { prepareEmbedding } from '../services/embedding-service.js';

const router: Router = Router();

function getId(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return id ?? '';
}

const createMemorySchema = z.object({
  content: z.string().min(1),
  type: z.enum(['fact', 'preference', 'context', 'skill', 'conversation', 'observation', 'instruction']),
  scope: z.string().min(1),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  expiresAt: z.string().optional(),
});

const updateMemorySchema = z.object({
  content: z.string().min(1).optional(),
  type: z.enum(['fact', 'preference', 'context', 'skill', 'conversation', 'observation', 'instruction']).optional(),
  scope: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  expiresAt: z.string().optional().nullable(),
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createMemorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const memory = createMemory({
      ...parsed.data,
      tags: parsed.data.tags,
      metadata: parsed.data.metadata,
    });

    await prepareEmbedding(memory);

    return res.status(201).json(memory);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const scope = typeof req.query.scope === 'string' ? req.query.scope : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type as MemoryType : undefined;
    const tags = typeof req.query.tags === 'string' ? req.query.tags.split(',') : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : undefined;
    const offset = typeof req.query.offset === 'string' ? parseInt(req.query.offset, 10) : undefined;

    const filter: { scope?: string; type?: MemoryType; tags?: string[]; limit?: number; offset?: number } = {};
    if (scope !== undefined) filter.scope = scope;
    if (type !== undefined) filter.type = type;
    if (tags !== undefined) filter.tags = tags;
    if (limit !== undefined) filter.limit = limit;
    if (offset !== undefined) filter.offset = offset;

    const memories = listMemories(filter);
    return res.json({ memories, total: memories.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const memory = getMemory(getId(req));
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    return res.json(memory);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateMemorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const updates: Partial<Memory> = {};
    if (parsed.data.content !== undefined) updates.content = parsed.data.content;
    if (parsed.data.type !== undefined) updates.type = parsed.data.type;
    if (parsed.data.scope !== undefined) updates.scope = parsed.data.scope;
    if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;
    if (parsed.data.metadata !== undefined) updates.metadata = parsed.data.metadata;
    if (parsed.data.expiresAt !== undefined) updates.expiresAt = parsed.data.expiresAt ?? undefined;

    const memory = updateMemory(getId(req), updates);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    await prepareEmbedding(memory);

    return res.json(memory);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = deleteMemory(getId(req));
    if (!deleted) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    return res.json({ id: getId(req), deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/cleanup', (req: Request, res: Response) => {
  try {
    const cleaned = cleanupExpiredMemories();
    return res.json({ cleaned, remaining: getMemoryCount() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
