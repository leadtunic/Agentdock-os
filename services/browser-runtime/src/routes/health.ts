import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';
import { isBrowserRunning, getActiveSessionCount, getActivePageCount } from '../services/browser-manager.js';
import { getSessionCount, getActiveSessionCount as getActiveSessionCountFromManager } from '../services/session-manager.js';

const router: Router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'browser-runtime',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      headless: config.browserHeadless,
      storagePath: config.browserStoragePath,
      timeout: config.browserTimeout,
      maxSessions: config.browserMaxSessions,
    },
    metrics: {
      browserRunning: isBrowserRunning(),
      activeContexts: getActiveSessionCount(),
      activePages: getActivePageCount(),
      totalSessions: getSessionCount(),
      activeSessions: getActiveSessionCountFromManager(),
      memoryUsage: process.memoryUsage(),
    },
  });
});

export default router;
