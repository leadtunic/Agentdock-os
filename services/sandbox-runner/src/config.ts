import { z } from 'zod';

export const configSchema = z.object({
  port: z.coerce.number().default(8070),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  apiBaseUrl: z.string().default('http://localhost:8000'),
  jwtSecret: z.string().default('change-me'),

  defaultTimeoutSeconds: z.coerce.number().default(30),
  maxTimeoutSeconds: z.coerce.number().default(120),
  maxMemoryMb: z.coerce.number().default(512),
  maxCpuPercent: z.coerce.number().default(80),
  sandboxWorkingDir: z.string().default('/tmp/agentdock-sandbox'),
  allowedPaths: z.string().default('/tmp/agentdock-sandbox,/data'),
  blockedCommands: z.string().default('rm -rf,sudo,su,mkfs,dd,chmod 777,kill,killall'),
  maxConcurrentSandboxes: z.coerce.number().default(10),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const result = configSchema.safeParse({
    port: process.env.SANDBOX_PORT,
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    apiBaseUrl: process.env.API_URL,
    jwtSecret: process.env.JWT_SECRET,
    defaultTimeoutSeconds: process.env.SANDBOX_DEFAULT_TIMEOUT,
    maxTimeoutSeconds: process.env.SANDBOX_MAX_TIMEOUT,
    maxMemoryMb: process.env.SANDBOX_MAX_MEMORY,
    maxCpuPercent: process.env.SANDBOX_MAX_CPU,
    sandboxWorkingDir: process.env.SANDBOX_WORKING_DIR,
    allowedPaths: process.env.SANDBOX_ALLOWED_PATHS,
    blockedCommands: process.env.SANDBOX_BLOCKED_COMMANDS,
    maxConcurrentSandboxes: process.env.SANDBOX_MAX_CONCURRENT,
  });

  if (!result.success) {
    console.error('Invalid configuration:', result.error.flatten());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
