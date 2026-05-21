import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { authMiddleware } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import sessionsRouter from './routes/sessions.js';
import actionsRouter from './routes/actions.js';
import { shutdown } from './services/browser-manager.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
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
app.use('/api/sessions', authMiddleware, sessionsRouter);
app.use('/api/actions', authMiddleware, actionsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'browser-runtime' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = config.port;
const server = app.listen(port, () => {
  console.log(`Browser Runtime listening on port ${port}`);
  console.log(`  Headless: ${config.browserHeadless}`);
  console.log(`  Storage: ${config.browserStoragePath}`);
  console.log(`  Environment: ${config.nodeEnv}`);
});

async function gracefulShutdown(): Promise<void> {
  console.log('Shutting down browser runtime...');
  await shutdown();
  server.close();
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
