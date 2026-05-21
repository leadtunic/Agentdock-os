import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { existsSync, mkdirSync } from 'fs';
import { config } from './config.js';
import { authMiddleware } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import commandsRouter from './routes/commands.js';
import filesRouter from './routes/files.js';
import { listSandboxes, closeSandbox } from './services/sandbox-manager.js';

const app: express.Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
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
app.use('/api/commands', authMiddleware, commandsRouter);
app.use('/api/files', authMiddleware, filesRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sandbox-runner' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

try {
  if (!existsSync(config.sandboxWorkingDir)) {
    mkdirSync(config.sandboxWorkingDir, { recursive: true });
    console.log(`Created sandbox working directory: ${config.sandboxWorkingDir}`);
  }
} catch (error) {
  console.warn('Failed to create sandbox working directory:', error);
}

const port = config.port;
const server = app.listen(port, () => {
  console.log(`Sandbox Runner listening on port ${port}`);
  console.log(`  Working Dir: ${config.sandboxWorkingDir}`);
  console.log(`  Default Timeout: ${config.defaultTimeoutSeconds}s`);
  console.log(`  Max Memory: ${config.maxMemoryMb}MB`);
  console.log(`  Environment: ${config.nodeEnv}`);
});

async function gracefulShutdown(): Promise<void> {
  console.log('Shutting down sandbox runner...');

  const activeSandboxes = listSandboxes({ status: 'running' });
  for (const sandbox of activeSandboxes) {
    closeSandbox(sandbox.id);
  }

  server.close();
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
