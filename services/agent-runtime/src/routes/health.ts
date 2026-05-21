import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';
import { getSessionCount, getActiveSessionCount } from '../services/session-manager.js';

const router: Router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'agent-runtime',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      provider: config.llmProvider,
      model: config.llmModel,
      maxRuntimeMinutes: config.agentMaxRuntimeMinutes,
      costLimit: config.agentDefaultCostLimit,
      auditLogEnabled: config.enableAuditLog,
      costTrackingEnabled: config.enableCostTracking,
    },
    metrics: {
      totalSessions: getSessionCount(),
      activeSessions: getActiveSessionCount(),
      memoryUsage: process.memoryUsage(),
    },
  });
});

export default router;
