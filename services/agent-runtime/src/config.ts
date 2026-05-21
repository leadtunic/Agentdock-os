import { z } from 'zod';

export const configSchema = z.object({
  port: z.coerce.number().default(8020),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  apiBaseUrl: z.string().default('http://localhost:8000'),
  memoryEngineUrl: z.string().default('http://localhost:8050'),
  skillEngineUrl: z.string().default('http://localhost:8060'),
  sandboxUrl: z.string().default('http://localhost:8070'),
  browserRuntimeUrl: z.string().default('http://localhost:8010'),

  llmProvider: z.enum(['openai', 'anthropic', 'google', 'groq', 'openrouter', 'ollama', 'lm_studio']).default('openai'),
  llmBaseUrl: z.string().optional(),
  llmApiKey: z.string().optional(),
  llmModel: z.string().default('gpt-4o'),
  llmTemperature: z.coerce.number().min(0).max(2).default(0.7),
  llmMaxTokens: z.coerce.number().default(4096),

  jwtSecret: z.string().default('change-me'),
  agentMaxRuntimeMinutes: z.coerce.number().default(30),
  agentDefaultCostLimit: z.coerce.number().default(2.0),

  enableAuditLog: z.coerce.boolean().default(true),
  enableCostTracking: z.coerce.boolean().default(true),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const result = configSchema.safeParse({
    port: process.env.AGENT_RUNTIME_PORT,
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    apiBaseUrl: process.env.API_URL,
    memoryEngineUrl: process.env.MEMORY_ENGINE_URL,
    skillEngineUrl: process.env.SKILL_ENGINE_URL,
    sandboxUrl: process.env.SANDBOX_URL,
    browserRuntimeUrl: process.env.BROWSER_RUNTIME_URL,
    llmProvider: process.env.LLM_PROVIDER,
    llmBaseUrl: process.env.LLM_BASE_URL,
    llmApiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY,
    llmModel: process.env.LLM_MODEL,
    llmTemperature: process.env.LLM_TEMPERATURE,
    llmMaxTokens: process.env.LLM_MAX_TOKENS,
    jwtSecret: process.env.JWT_SECRET,
    agentMaxRuntimeMinutes: process.env.AGENT_MAX_RUNTIME_MINUTES,
    agentDefaultCostLimit: process.env.AGENT_DEFAULT_COST_LIMIT,
    enableAuditLog: process.env.ENABLE_AUDIT_LOG,
    enableCostTracking: process.env.ENABLE_COST_TRACKING,
  });

  if (!result.success) {
    console.error('Invalid configuration:', result.error.flatten());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
