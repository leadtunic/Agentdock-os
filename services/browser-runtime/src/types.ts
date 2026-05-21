export interface BrowserSession {
  id: string;
  profileId: string;
  status: BrowserSessionStatus;
  url?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  consoleErrors: ConsoleError[];
  networkErrors: NetworkError[];
  screenshots: ScreenshotRecord[];
  recording?: boolean;
  videoPath?: string;
}

export type BrowserSessionStatus = 'created' | 'launching' | 'ready' | 'navigating' | 'busy' | 'idle' | 'closed' | 'error';

export interface ConsoleError {
  id: string;
  timestamp: string;
  type: string;
  text: string;
  location?: { url: string; lineNumber: number; columnNumber: number };
}

export interface NetworkError {
  id: string;
  timestamp: string;
  url: string;
  status: number;
  statusText: string;
}

export interface ScreenshotRecord {
  id: string;
  timestamp: string;
  path?: string;
  base64?: string;
}

export interface BrowserAction {
  type: 'open_url' | 'click' | 'type' | 'select' | 'navigate' | 'screenshot' | 'snapshot' | 'scroll' | 'hover' | 'press_key' | 'evaluate';
  selector?: string;
  url?: string;
  text?: string;
  value?: string;
  key?: string;
  options?: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  output?: string;
  screenshot?: string;
  snapshot?: string;
  error?: string;
  durationMs: number;
}

export interface BrowserConfig {
  headless: boolean;
  userDataDir?: string;
  viewport?: { width: number; height: number };
  locale?: string;
  timezoneId?: string;
  recordVideo?: boolean;
  recordVideoDir?: string;
}
