import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { authMiddleware } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import sessionsRouter from './routes/sessions.js';
import toolCallsRouter from './routes/tool-calls.js';

const app: express.Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
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
app.use('/api/tool-calls', authMiddleware, toolCallsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'agent-runtime' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = config.port;
app.listen(port, () => {
  console.log(`Agent Runtime listening on port ${port}`);
  console.log(`  Provider: ${config.llmProvider}`);
  console.log(`  Model: ${config.llmModel}`);
  console.log(`  Environment: ${config.nodeEnv}`);
});

export default app;
