import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';
import { getChannelCount, getActiveChannelCount } from '../services/channel-manager.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'gateway',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      telegramConfigured: !!config.telegramBotToken,
      discordConfigured: !!config.discordBotToken,
      slackConfigured: !!config.slackBotToken,
      emailConfigured: !!config.smtpHost,
    },
    metrics: {
      totalChannels: getChannelCount(),
      activeChannels: getActiveChannelCount(),
      memoryUsage: process.memoryUsage(),
    },
  });
});

export default router;
