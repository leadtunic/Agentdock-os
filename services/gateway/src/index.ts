import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { authMiddleware } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import webhooksRouter from './routes/webhooks.js';
import channelsRouter from './routes/channels.js';
import { createWebchatSession, cleanupInactiveSessions } from './services/webchat.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
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
app.use('/api/webhooks', webhooksRouter);
app.use('/api/channels', authMiddleware, channelsRouter);

app.post('/api/webchat/sessions', (req, res) => {
  try {
    const sessionId = createWebchatSession();
    res.status(201).json({ sessionId, status: 'created' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gateway' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const cleanupInterval = setInterval(() => {
  cleanupInactiveSessions(60);
}, 10 * 60 * 1000);

const port = config.port;
const server = app.listen(port, () => {
  console.log(`Gateway listening on port ${port}`);
  console.log(`  Telegram: ${config.telegramBotToken ? 'configured' : 'not configured'}`);
  console.log(`  Discord: ${config.discordBotToken ? 'configured' : 'not configured'}`);
  console.log(`  Slack: ${config.slackBotToken ? 'configured' : 'not configured'}`);
  console.log(`  Email: ${config.smtpHost ? 'configured' : 'not configured'}`);
  console.log(`  Environment: ${config.nodeEnv}`);
});

async function gracefulShutdown(): Promise<void> {
  console.log('Shutting down gateway...');
  clearInterval(cleanupInterval);
  server.close();
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
