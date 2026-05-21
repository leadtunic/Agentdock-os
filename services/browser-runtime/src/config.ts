import { z } from 'zod';

export const configSchema = z.object({
  port: z.coerce.number().default(8010),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  browserHeadless: z.coerce.boolean().default(true),
  browserStoragePath: z.string().default('/data/browser'),
  browserTimeout: z.coerce.number().default(30000),
  browserMaxSessions: z.coerce.number().default(10),

  apiBaseUrl: z.string().default('http://localhost:8000'),
  jwtSecret: z.string().default('change-me'),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const result = configSchema.safeParse({
    port: process.env.BROWSER_RUNTIME_PORT,
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    browserHeadless: process.env.BROWSER_HEADLESS,
    browserStoragePath: process.env.BROWSER_STORAGE_PATH,
    browserTimeout: process.env.BROWSER_TIMEOUT,
    browserMaxSessions: process.env.BROWSER_MAX_SESSIONS,
    apiBaseUrl: process.env.API_URL,
    jwtSecret: process.env.JWT_SECRET,
  });

  if (!result.success) {
    console.error('Invalid configuration:', result.error.flatten());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
