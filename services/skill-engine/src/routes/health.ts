import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';
import { getSkillCount, getActiveSkillCount } from '../services/skill-registry.js';
import { getExecutionCount, getActiveExecutionCount } from '../services/skill-executor.js';

const router: Router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'skill-engine',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      maxExecutionTimeSeconds: config.maxExecutionTimeSeconds,
      maxStepsPerSkill: config.maxStepsPerSkill,
      defaultStepTimeout: config.defaultStepTimeout,
    },
    metrics: {
      totalSkills: getSkillCount(),
      activeSkills: getActiveSkillCount(),
      totalExecutions: getExecutionCount(),
      activeExecutions: getActiveExecutionCount(),
      memoryUsage: process.memoryUsage(),
    },
  });
});

export default router;
