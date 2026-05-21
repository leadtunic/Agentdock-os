import { z } from 'zod';

export const configSchema = z.object({
  port: z.coerce.number().default(8030),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  apiBaseUrl: z.string().default('http://localhost:8000'),
  agentRuntimeUrl: z.string().default('http://localhost:8020'),

  telegramBotToken: z.string().optional(),
  discordBotToken: z.string().optional(),
  slackBotToken: z.string().optional(),

  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().default(587),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpFrom: z.string().optional(),

  jwtSecret: z.string().default('change-me'),
  webhookSecret: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const result = configSchema.safeParse({
    port: process.env.GATEWAY_PORT,
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    apiBaseUrl: process.env.API_URL,
    agentRuntimeUrl: process.env.AGENT_RUNTIME_URL,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    discordBotToken: process.env.DISCORD_BOT_TOKEN,
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpFrom: process.env.SMTP_FROM,
    jwtSecret: process.env.JWT_SECRET,
    webhookSecret: process.env.WEBHOOK_SECRET,
  });

  if (!result.success) {
    console.error('Invalid configuration:', result.error.flatten());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
