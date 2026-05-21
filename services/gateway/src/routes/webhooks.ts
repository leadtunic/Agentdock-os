import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { webhookAuthMiddleware } from '../middleware/auth.js';
import { processWebhook, getWebhookEvents } from '../services/webhook.js';
import { handleTelegramUpdate } from '../services/telegram.js';
import { handleDiscordEvent } from '../services/discord.js';
import { handleSlackEvent } from '../services/slack.js';
import { handleEmailReply } from '../services/email.js';

const router: Router = Router();

function getChannel(req: Request): string {
  const channel = Array.isArray(req.params.channel) ? req.params.channel[0] : req.params.channel;
  return channel ?? '';
}

router.post('/:channel', webhookAuthMiddleware, (req: Request, res: Response) => {
  try {
    const channel = getChannel(req);
    const payload = req.body;

    const event = processWebhook(channel, payload);

    return res.status(202).json({
      accepted: true,
      eventId: event.id,
      channel,
      processed: event.processed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/telegram', webhookAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const message = await handleTelegramUpdate(req.body);

    if (message) {
      return res.status(202).json({
        accepted: true,
        messageId: message.id,
        sender: message.senderName,
        content: message.content.substring(0, 100),
      });
    }

    return res.json({ accepted: true, type: 'non_message_event' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/discord', webhookAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const message = await handleDiscordEvent(req.body);

    if (message) {
      return res.status(202).json({
        accepted: true,
        messageId: message.id,
        sender: message.senderName,
        content: message.content.substring(0, 100),
      });
    }

    return res.json({ accepted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/slack', webhookAuthMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.body.type === 'url_verification') {
      return res.json({ challenge: req.body.challenge });
    }

    const message = await handleSlackEvent(req.body);

    if (message) {
      return res.status(202).json({
        accepted: true,
        messageId: message.id,
        sender: message.senderId,
        content: message.content.substring(0, 100),
      });
    }

    return res.json({ accepted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/email', webhookAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const message = await handleEmailReply(req.body);

    if (message) {
      return res.status(202).json({
        accepted: true,
        messageId: message.id,
        sender: message.senderId,
        content: message.content.substring(0, 100),
      });
    }

    return res.json({ accepted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/events', (req: Request, res: Response) => {
  try {
    const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
    const processed = req.query.processed === 'true' ? true : req.query.processed === 'false' ? false : undefined;

    const events = getWebhookEvents({ ...(channel ? { channel } : {}), ...(processed !== undefined ? { processed } : {}) });
    return res.json({ events, total: events.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
