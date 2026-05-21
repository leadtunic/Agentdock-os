import { z } from 'zod';

export const configSchema = z.object({
  port: z.coerce.number().default(8050),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  apiBaseUrl: z.string().default('http://localhost:8000'),
  jwtSecret: z.string().default('change-me'),

  embeddingModel: z.string().default('text-embedding-3-small'),
  embeddingDimensions: z.coerce.number().default(1536),
  maxMemoriesPerScope: z.coerce.number().default(100),
  defaultExpirationDays: z.coerce.number().default(30),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const result = configSchema.safeParse({
    port: process.env.MEMORY_ENGINE_PORT,
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    apiBaseUrl: process.env.API_URL,
    jwtSecret: process.env.JWT_SECRET,
    embeddingModel: process.env.EMBEDDING_MODEL,
    embeddingDimensions: process.env.EMBEDDING_DIMENSIONS,
    maxMemoriesPerScope: process.env.MAX_MEMORIES_PER_SCOPE,
    defaultExpirationDays: process.env.DEFAULT_EXPIRATION_DAYS,
  });

  if (!result.success) {
    console.error('Invalid configuration:', result.error.flatten());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
