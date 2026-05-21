import type { ChannelMessage, ChannelResponse } from '../types.js';

const webchatSessions = new Map<string, WebchatSession>();
const messageHistory: ChannelMessage[] = [];

interface WebchatSession {
  id: string;
  createdAt: string;
  lastActiveAt: string;
  messageCount: number;
}

export function createWebchatSession(): string {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  webchatSessions.set(id, {
    id,
    createdAt: now,
    lastActiveAt: now,
    messageCount: 0,
  });

  return id;
}

export function getWebchatSession(sessionId: string): WebchatSession | undefined {
  return webchatSessions.get(sessionId);
}

export function listWebchatSessions(): WebchatSession[] {
  return Array.from(webchatSessions.values())
    .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));
}

export async function handleWebchatMessage(sessionId: string, content: string): Promise<ChannelMessage | null> {
  const session = webchatSessions.get(sessionId);
  if (!session) return null;

  const message: ChannelMessage = {
    id: crypto.randomUUID(),
    channelId: sessionId,
    channelType: 'webchat',
    senderId: sessionId,
    content,
    timestamp: new Date().toISOString(),
  };

  messageHistory.push(message);
  session.lastActiveAt = new Date().toISOString();
  session.messageCount++;

  return message;
}

export async function sendWebchatMessage(sessionId: string, content: string): Promise<ChannelResponse> {
  const session = webchatSessions.get(sessionId);
  if (!session) {
    return { channelId: sessionId, content, error: 'Session not found' } as unknown as ChannelResponse;
  }

  const message: ChannelMessage = {
    id: crypto.randomUUID(),
    channelId: sessionId,
    channelType: 'webchat',
    senderId: 'agent',
    content,
    timestamp: new Date().toISOString(),
  };

  messageHistory.push(message);
  session.lastActiveAt = new Date().toISOString();

  return {
    channelId: sessionId,
    content,
  };
}

export function getSessionHistory(sessionId: string): ChannelMessage[] {
  return messageHistory.filter((m) => m.channelId === sessionId);
}

export function cleanupInactiveSessions(maxAgeMinutes: number = 60): void {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();

  for (const [id, session] of webchatSessions) {
    if (session.lastActiveAt < cutoff) {
      webchatSessions.delete(id);
    }
  }
}
