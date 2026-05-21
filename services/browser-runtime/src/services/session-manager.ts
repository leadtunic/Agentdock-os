import type { BrowserSession, BrowserSessionStatus, ConsoleError, NetworkError, ScreenshotRecord } from '../types.js';

const sessions = new Map<string, BrowserSession>();

export function createSession(params: {
  id: string;
  profileId: string;
}): BrowserSession {
  const now = new Date().toISOString();
  const session: BrowserSession = {
    id: params.id,
    profileId: params.profileId,
    status: 'created',
    createdAt: now,
    updatedAt: now,
    consoleErrors: [],
    networkErrors: [],
    screenshots: [],
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): BrowserSession | undefined {
  return sessions.get(id);
}

export function listSessions(filter?: { profileId?: string; status?: BrowserSessionStatus }): BrowserSession[] {
  let result = Array.from(sessions.values());
  if (filter?.profileId) result = result.filter((s) => s.profileId === filter.profileId);
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateSessionStatus(id: string, status: BrowserSessionStatus): BrowserSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  session.status = status;
  session.updatedAt = new Date().toISOString();

  if (status === 'closed') {
    session.closedAt = new Date().toISOString();
  }

  return session;
}

export function setSessionUrl(id: string, url: string): BrowserSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  session.url = url;
  session.updatedAt = new Date().toISOString();
  return session;
}

export function addConsoleError(sessionId: string, error: Omit<ConsoleError, 'id' | 'timestamp'>): BrowserSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  session.consoleErrors.push({
    ...error,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });

  session.updatedAt = new Date().toISOString();
  return session;
}

export function addNetworkError(sessionId: string, error: Omit<NetworkError, 'id' | 'timestamp'>): BrowserSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  session.networkErrors.push({
    ...error,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });

  session.updatedAt = new Date().toISOString();
  return session;
}

export function addScreenshot(sessionId: string, record: Omit<ScreenshotRecord, 'id' | 'timestamp'>): BrowserSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;

  session.screenshots.push({
    ...record,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });

  session.updatedAt = new Date().toISOString();
  return session;
}

export function setRecording(sessionId: string, recording: boolean, videoPath?: string): BrowserSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  session.recording = recording;
  session.videoPath = videoPath;
  session.updatedAt = new Date().toISOString();
  return session;
}

export function getSessionCount(): number {
  return sessions.size;
}

export function getActiveSessionCount(): number {
  return Array.from(sessions.values()).filter((s) =>
    ['created', 'launching', 'ready', 'navigating', 'busy', 'idle'].includes(s.status),
  ).length;
}
