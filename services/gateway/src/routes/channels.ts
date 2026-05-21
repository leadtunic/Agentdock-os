import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import type { ChannelType, ChannelStatus } from '../types.js';
import {
  createChannel,
  getChannel,
  listChannels,
  updateChannelStatus,
  updateChannelConfig,
  deleteChannel,
} from '../services/channel-manager.js';

const router: Router = Router();

function getId(req: Request): string {
  const id = Array.isArray(getId(req)) ? getId(req)[0] : getId(req);
  return id ?? '';
}

const createChannelSchema = z.object({
  type: z.enum(['telegram', 'discord', 'slack', 'email', 'webhook', 'webchat']),
  name: z.string().min(1),
  config: z.record(z.unknown()).optional(),
});

router.post('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const parsed = createChannelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const channel = createChannel({
      type: parsed.data.type,
      name: parsed.data.name,
      config: parsed.data.config ?? {},
    });

    return res.status(201).json(channel);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const type = typeof req.query.type === 'string' ? (req.query.type as ChannelType) : undefined;
    const status = typeof req.query.status === 'string' ? (req.query.status as ChannelStatus) : undefined;

    const channels = listChannels({ ...(type ? { type } : {}), ...(status ? { status } : {}) });
    return res.json({ channels, total: channels.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const channel = getChannel(getId(req));
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    return res.json(channel);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.patch('/:id/status', authMiddleware, (req: Request, res: Response) => {
  try {
    const statusSchema = z.object({
      status: z.enum(['active', 'inactive', 'error', 'connecting']),
    });

    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const channel = updateChannelStatus(getId(req), parsed.data.status);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    return res.json(channel);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.patch('/:id/config', authMiddleware, (req: Request, res: Response) => {
  try {
    const channel = updateChannelConfig(getId(req), req.body);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    return res.json(channel);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const deleted = deleteChannel(getId(req));
    if (!deleted) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    return res.json({ id: getId(req), deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
