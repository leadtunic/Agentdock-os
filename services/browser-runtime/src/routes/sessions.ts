import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createProfile, createPage, closeProfile, closePage } from '../services/browser-manager.js';
import type { BrowserSessionStatus } from '../types.js';
import {
  createSession,
  getSession,
  listSessions,
  updateSessionStatus,
  setSessionUrl,
  setRecording,
} from '../services/session-manager.js';

const router = Router();

const createSessionSchema = z.object({
  profileId: z.string().min(1).optional(),
  recordVideo: z.boolean().optional(),
  viewport: z.object({ width: z.number(), height: z.number() }).optional(),
  locale: z.string().optional(),
  timezoneId: z.string().optional(),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const profileId = parsed.data.profileId ?? crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    await createProfile(profileId, {
      recordVideo: parsed.data.recordVideo,
      viewport: parsed.data.viewport,
      locale: parsed.data.locale,
      timezoneId: parsed.data.timezoneId,
    });

    const page = await createPage(profileId);
    const pageId = crypto.randomUUID();

    const session = createSession({ id: sessionId, profileId });
    updateSessionStatus(sessionId, 'ready');

    return res.status(201).json({
      ...session,
      pageId,
      profileId,
      status: 'ready',
      mode: 'isolated_profile',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/', (_req: Request, res: Response) => {
  try {
    const profileId = typeof _req.query.profileId === 'string' ? _req.query.profileId : undefined;
    const status = typeof _req.query.status === 'string' ? (_req.query.status as BrowserSessionStatus) : undefined;

    const sessions = listSessions({ profileId, ...(status ? { status } : {}) });
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

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const session = getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await closeProfile(session.profileId);
    updateSessionStatus(req.params.id, 'closed');

    return res.json({ id: req.params.id, status: 'closed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/:id/record', async (req: Request, res: Response) => {
  try {
    const session = getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const start = req.body.start ?? true;
    const videoPath = req.body.videoPath;

    setRecording(req.params.id, start, videoPath);

    return res.json({ id: req.params.id, recording: start, videoPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
