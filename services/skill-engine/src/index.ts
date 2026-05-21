import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { authMiddleware } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import skillsRouter from './routes/skills.js';
import executeRouter from './routes/execute.js';

const app: express.Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  const start = Date.now();
  _res.on('finish', () => {
    const duration = Date.now() - start;
    if (config.logLevel === 'debug') {
      console.log(`${req.method} ${req.path} ${_res.statusCode} ${duration}ms`);
    }
  });
  next();
});

app.use('/api/health', healthRouter);
app.use('/api/skills', authMiddleware, skillsRouter);
app.use('/api/execute', authMiddleware, executeRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'skill-engine' });
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
  console.log(`Skill Engine listening on port ${port}`);
  console.log(`  Max Execution Time: ${config.maxExecutionTimeSeconds}s`);
  console.log(`  Max Steps: ${config.maxStepsPerSkill}`);
  console.log(`  Environment: ${config.nodeEnv}`);
});

async function gracefulShutdown(): Promise<void> {
  console.log('Shutting down skill engine...');
  server.close();
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
