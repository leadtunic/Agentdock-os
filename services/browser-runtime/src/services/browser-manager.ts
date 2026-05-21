import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { config } from '../config.js';
import type { BrowserConfig } from '../types.js';

let globalBrowser: Browser | null = null;
const contexts = new Map<string, BrowserContext>();
const pages = new Map<string, Page>();

export async function initBrowser(): Promise<Browser> {
  if (!globalBrowser) {
    globalBrowser = await chromium.launch({
      headless: config.browserHeadless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return globalBrowser;
}

export async function createProfile(profileId: string, browserConfig?: Partial<BrowserConfig>): Promise<BrowserContext> {
  const browser = await initBrowser();

  const userDataDir = browserConfig?.userDataDir ?? `${config.browserStoragePath}/profiles/${profileId}`;

  const context = await browser.newContext({
    viewport: browserConfig?.viewport ?? { width: 1280, height: 720 },
    locale: browserConfig?.locale ?? 'en-US',
    timezoneId: browserConfig?.timezoneId ?? 'UTC',
    recordVideo: browserConfig?.recordVideo
      ? { dir: browserConfig?.recordVideoDir ?? `${config.browserStoragePath}/videos/${profileId}` }
      : undefined,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  contexts.set(profileId, context);

  context.on('page', (page) => {
    const pageId = crypto.randomUUID();
    pages.set(pageId, page);

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[Browser ${profileId}] Console error: ${msg.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      console.error(`[Browser ${profileId}] Page error: ${error.message}`);
    });
  });

  return context;
}

export async function createPage(profileId: string): Promise<Page> {
  const context = contexts.get(profileId);
  if (!context) {
    throw new Error(`No context found for profile ${profileId}`);
  }

  const page = await context.newPage();
  const pageId = crypto.randomUUID();
  pages.set(pageId, page);
  return page;
}

export function getPage(pageId: string): Page | undefined {
  return pages.get(pageId);
}

export function getContext(profileId: string): BrowserContext | undefined {
  return contexts.get(profileId);
}

export async function closePage(pageId: string): Promise<void> {
  const page = pages.get(pageId);
  if (page) {
    await page.close().catch(() => {});
    pages.delete(pageId);
  }
}

export async function closeProfile(profileId: string): Promise<void> {
  const context = contexts.get(profileId);
  if (context) {
    await context.close().catch(() => {});
    contexts.delete(profileId);

    for (const [pageId, page] of pages) {
      if (page.context() === context) {
        pages.delete(pageId);
      }
    }
  }
}

export async function shutdown(): Promise<void> {
  for (const profileId of contexts.keys()) {
    await closeProfile(profileId);
  }

  if (globalBrowser) {
    await globalBrowser.close();
    globalBrowser = null;
  }
}

export function getActiveSessionCount(): number {
  return contexts.size;
}

export function getActivePageCount(): number {
  return pages.size;
}

export function isBrowserRunning(): boolean {
  return globalBrowser !== null && globalBrowser.isConnected();
}
