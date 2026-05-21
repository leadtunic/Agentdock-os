import type { AgentMessage } from '../types.js';
import { config } from '../config.js';

export interface ContextData {
  systemPrompt: string;
  messages: AgentMessage[];
  relevantMemories: MemorySnippet[];
  activeSkills: SkillSnippet[];
  toolDefinitions: ToolDefinition[];
}

export interface MemorySnippet {
  id: string;
  content: string;
  scope: string;
  relevanceScore?: number;
}

export interface SkillSnippet {
  id: string;
  name: string;
  description: string;
  instructions: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export async function buildContext(params: {
  sessionId: string;
  taskId: string;
  agentId: string;
  systemPrompt?: string;
  fetchMemories?: (agentId: string, taskId: string) => Promise<MemorySnippet[]>;
  fetchSkills?: (agentId: string) => Promise<SkillSnippet[]>;
  fetchTools?: () => Promise<ToolDefinition[]>;
}): Promise<ContextData> {
  const memories = params.fetchMemories
    ? await params.fetchMemories(params.agentId, params.taskId)
    : await fetchMemoriesFromEngine(params.agentId, params.taskId);

  const skills = params.fetchSkills
    ? await params.fetchSkills(params.agentId)
    : await fetchSkillsFromEngine(params.agentId);

  const tools = params.fetchTools
    ? await params.fetchTools()
    : [];

  const systemPrompt = params.systemPrompt ?? buildDefaultSystemPrompt(memories, skills);

  const messages: AgentMessage[] = [
    {
      id: crypto.randomUUID(),
      role: 'system',
      content: systemPrompt,
      timestamp: new Date().toISOString(),
    },
  ];

  return {
    systemPrompt,
    messages,
    relevantMemories: memories,
    activeSkills: skills,
    toolDefinitions: tools,
  };
}

export function buildMessagesForLLM(context: ContextData, userMessage: string): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [];

  messages.push({ role: 'system', content: context.systemPrompt });

  for (const memory of context.relevantMemories) {
    messages.push({
      role: 'system',
      content: `[Relevant Memory] ${memory.content}`,
    });
  }

  for (const skill of context.activeSkills) {
    messages.push({
      role: 'system',
      content: `[Active Skill: ${skill.name}] ${skill.instructions}`,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  return messages;
}

function buildDefaultSystemPrompt(memories: MemorySnippet[], skills: SkillSnippet[]): string {
  const parts = [
    'You are an AI agent running on AgentDock OS. Follow these guidelines:',
    '- Be concise and accurate in your responses',
    '- Use available tools when needed',
    '- Respect governance and approval requirements',
    '- Maintain context across interactions',
  ];

  if (memories.length > 0) {
    parts.push(`\nYou have ${memories.length} relevant memory entries available for context.`);
  }

  if (skills.length > 0) {
    parts.push(`\nYou have ${skills.length} active skills loaded: ${skills.map((s) => s.name).join(', ')}.`);
  }

  return parts.join('\n');
}

async function fetchMemoriesFromEngine(agentId: string, taskId: string): Promise<MemorySnippet[]> {
  try {
    const url = `${config.memoryEngineUrl}/api/memories?scope=agent:${agentId}&scope=task:${taskId}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const data = (await response.json()) as { memories: Array<{ id: string; content: string; scope: string }> };
    return (data.memories ?? []).map((m) => ({
      id: m.id,
      content: m.content,
      scope: m.scope,
    }));
  } catch {
    return [];
  }
}

async function fetchSkillsFromEngine(agentId: string): Promise<SkillSnippet[]> {
  try {
    const url = `${config.skillEngineUrl}/api/skills?agentId=${agentId}&active=true`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const data = (await response.json()) as { skills: Array<{ id: string; name: string; description: string; instructions: string }> };
    return (data.skills ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      instructions: s.instructions,
    }));
  } catch {
    return [];
  }
}
