import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import type { SessionStatus } from '../types.js';
import {
  createSession,
  getSession,
  listSessions,
  updateSessionStatus,
  addMessage,
  getCostRecords,
  getAuditLogs,
} from '../services/session-manager.js';

const router = Router();

const createSessionSchema = z.object({
  agentId: z.string().min(1),
  taskId: z.string().min(1),
  model: z.string().optional(),
  provider: z.string().optional(),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.string(),
  })).optional(),
});

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const { agentId, taskId, model, provider } = parsed.data;
    const session = createSession({
      id: crypto.randomUUID(),
      agentId,
      taskId,
      model: model ?? 'gpt-4o',
      provider: provider ?? 'openai',
    });

    if (parsed.data.messages && parsed.data.messages.length > 0) {
      for (const msg of parsed.data.messages) {
        addMessage(session.id, msg);
      }
    }

    return res.status(201).json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/', (_req: Request, res: Response) => {
  try {
    const agentId = typeof _req.query.agentId === 'string' ? _req.query.agentId : undefined;
    const taskId = typeof _req.query.taskId === 'string' ? _req.query.taskId : undefined;
    const status = typeof _req.query.status === 'string' ? (_req.query.status as SessionStatus) : undefined;

    const sessions = listSessions({ agentId, taskId, ...(status ? { status } : {}) });
    return res.json({ sessions, total: sessions.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const session = getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const statusSchema = z.object({
      status: z.enum(['created', 'queued', 'running', 'waiting_for_approval', 'waiting_for_user', 'completed', 'failed', 'cancelled']),
      error: z.string().optional(),
    });

    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const session = updateSessionStatus(req.params.id, parsed.data.status, parsed.data.error);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/:id/messages', (req: Request, res: Response) => {
  try {
    const messageSchema = z.object({
      role: z.enum(['system', 'user', 'assistant', 'tool']),
      content: z.string(),
      toolCallId: z.string().optional(),
    });

    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const session = addMessage(req.params.id, parsed.data);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({ messageId: session.messages[session.messages.length - 1]?.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id/cost', (req: Request, res: Response) => {
  try {
    const records = getCostRecords(req.params.id);
    const totalCost = records.reduce((sum, r) => sum + r.costUsd, 0);
    return res.json({ records, totalCost, recordCount: records.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id/audit', (req: Request, res: Response) => {
  try {
    const logs = getAuditLogs(req.params.id);
    return res.json({ logs, total: logs.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
