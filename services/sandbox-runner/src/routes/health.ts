import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';
import { getSandboxCount, getActiveSandboxCount } from '../services/sandbox-manager.js';

const router: Router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'sandbox-runner',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      defaultTimeoutSeconds: config.defaultTimeoutSeconds,
      maxTimeoutSeconds: config.maxTimeoutSeconds,
      maxMemoryMb: config.maxMemoryMb,
      maxCpuPercent: config.maxCpuPercent,
      workingDir: config.sandboxWorkingDir,
      maxConcurrentSandboxes: config.maxConcurrentSandboxes,
    },
    metrics: {
      totalSandboxes: getSandboxCount(),
      activeSandboxes: getActiveSandboxCount(),
      memoryUsage: process.memoryUsage(),
    },
  });
});

export default router;
