import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { authMiddleware } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import memoriesRouter from './routes/memories.js';
import searchRouter from './routes/search.js';
import { cleanupExpiredMemories } from './services/memory-store.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (config.logLevel === 'debug') {
      console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

app.use('/api/health', healthRouter);
app.use('/api/memories', authMiddleware, memoriesRouter);
app.use('/api/search', authMiddleware, searchRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'memory-engine' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const cleanupInterval = setInterval(() => {
  const cleaned = cleanupExpiredMemories();
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired memories`);
  }
}, 60 * 60 * 1000);

const port = config.port;
const server = app.listen(port, () => {
  console.log(`Memory Engine listening on port ${port}`);
  console.log(`  Embedding Model: ${config.embeddingModel}`);
  console.log(`  Dimensions: ${config.embeddingDimensions}`);
  console.log(`  Environment: ${config.nodeEnv}`);
});

async function gracefulShutdown(): Promise<void> {
  console.log('Shutting down memory engine...');
  clearInterval(cleanupInterval);
  server.close();
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
