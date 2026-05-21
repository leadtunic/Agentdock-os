import { Router, type Request, type Response } from 'express';
import { config } from '../config.js';
import { getMemoryCount, getActiveMemoryCount } from '../services/memory-store.js';
import { getEmbeddingCount } from '../services/embedding-service.js';

const router: Router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'memory-engine',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      embeddingModel: config.embeddingModel,
      embeddingDimensions: config.embeddingDimensions,
      maxMemoriesPerScope: config.maxMemoriesPerScope,
      defaultExpirationDays: config.defaultExpirationDays,
    },
    metrics: {
      totalMemories: getMemoryCount(),
      activeMemories: getActiveMemoryCount(),
      embeddings: getEmbeddingCount(),
      memoryUsage: process.memoryUsage(),
    },
  });
});

export default router;
