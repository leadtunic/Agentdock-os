import type { LLMRequest, LLMResponse, TokenUsage } from '../types.js';
import { config } from '../config.js';

export interface ProviderConfig {
  baseUrl: string;
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export function getProviderConfig(): ProviderConfig {
  const provider = config.llmProvider;

  let baseUrl = config.llmBaseUrl;
  if (!baseUrl) {
    switch (provider) {
      case 'openai':
        baseUrl = 'https://api.openai.com/v1';
        break;
      case 'anthropic':
        baseUrl = 'https://api.anthropic.com/v1';
        break;
      case 'google':
        baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai';
        break;
      case 'groq':
        baseUrl = 'https://api.groq.com/openai/v1';
        break;
      case 'openrouter':
        baseUrl = 'https://openrouter.ai/api/v1';
        break;
      case 'ollama':
        baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1';
        break;
      case 'lm_studio':
        baseUrl = process.env.LM_STUDIO_BASE_URL ?? 'http://localhost:1234/v1';
        break;
      default:
        baseUrl = 'https://api.openai.com/v1';
    }
  }

  return {
    baseUrl,
    apiKey: config.llmApiKey,
    model: config.llmModel,
    temperature: config.llmTemperature,
    maxTokens: config.llmMaxTokens,
  };
}

export async function callLLM(request: LLMRequest, providerConfig?: ProviderConfig): Promise<LLMResponse> {
  const cfg = providerConfig ?? getProviderConfig();

  const body: Record<string, unknown> = {
    model: request.model || cfg.model,
    messages: request.messages,
    temperature: request.temperature ?? cfg.temperature,
    max_tokens: request.maxTokens ?? cfg.maxTokens,
  };

  if (request.tools && request.tools.length > 0) {
    body.tools = request.tools;
  }

  if (request.stream) {
    body.stream = true;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (cfg.apiKey) {
    if (cfg.baseUrl.includes('anthropic.com') && !cfg.baseUrl.includes('openai')) {
      headers['x-api-key'] = cfg.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${cfg.apiKey}`;
    }
  }

  const url = `${cfg.baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as LLMResponse;
  return data;
}

export function extractTokenUsage(response: LLMResponse): TokenUsage {
  return {
    promptTokens: response.usage?.prompt_tokens ?? 0,
    completionTokens: response.usage?.completion_tokens ?? 0,
    totalTokens: response.usage?.total_tokens ?? 0,
  };
}

export function estimateCost(provider: string, model: string, usage: TokenUsage): number {
  const rates = getCostRates();
  const key = `${provider}/${model}`;
  const rate = rates[key] ?? rates['openai/gpt-4o'] ?? { promptPerMillion: 2.5, completionPerMillion: 10 };

  const promptCost = (usage.promptTokens / 1_000_000) * rate.promptPerMillion;
  const completionCost = (usage.completionTokens / 1_000_000) * rate.completionPerMillion;

  return Math.round((promptCost + completionCost) * 10000) / 10000;
}

function getCostRates(): Record<string, { promptPerMillion: number; completionPerMillion: number }> {
  return {
    'openai/gpt-4o': { promptPerMillion: 2.5, completionPerMillion: 10 },
    'openai/gpt-4o-mini': { promptPerMillion: 0.15, completionPerMillion: 0.6 },
    'openai/gpt-3.5-turbo': { promptPerMillion: 0.5, completionPerMillion: 1.5 },
    'anthropic/claude-3-5-sonnet-20241022': { promptPerMillion: 3, completionPerMillion: 15 },
    'anthropic/claude-3-haiku-20240307': { promptPerMillion: 0.25, completionPerMillion: 1.25 },
    'google/gemini-2.0-flash': { promptPerMillion: 0.1, completionPerMillion: 0.4 },
    'groq/llama-3.3-70b-versatile': { promptPerMillion: 0.59, completionPerMillion: 0.79 },
  };
}
