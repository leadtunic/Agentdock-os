import type { Page } from 'playwright';
import { getPage } from './browser-manager.js';

export interface ScreenshotOptions {
  fullPage?: boolean;
  format?: 'png' | 'jpeg';
  quality?: number;
  path?: string;
}

export async function captureScreenshot(pageId: string, options?: ScreenshotOptions): Promise<string | undefined> {
  const page = getPage(pageId);
  if (!page) return undefined;

  const screenshot = await page.screenshot({
    fullPage: options?.fullPage ?? false,
    type: options?.format ?? 'png',
    quality: options?.quality,
    path: options?.path,
  });

  return screenshot.toString('base64');
}

export async function captureElementScreenshot(pageId: string, selector: string, options?: ScreenshotOptions): Promise<string | undefined> {
  const page = getPage(pageId);
  if (!page) return undefined;

  const element = await page.$(selector);
  if (!element) return undefined;

  const screenshot = await element.screenshot({
    type: options?.format ?? 'png',
    quality: options?.quality,
    path: options?.path,
  });

  return screenshot.toString('base64');
}

export async function getPageSnapshot(pageId: string): Promise<{ title: string; url: string; content: string } | undefined> {
  const page = getPage(pageId);
  if (!page) return undefined;

  const title = await page.title();
  const url = page.url();
  const content = await page.content();

  return { title, url, content };
}

export async function getPageAccessibilitySnapshot(pageId: string): Promise<unknown> {
  const page = getPage(pageId);
  if (!page) return undefined;

  return (page as any).accessibility?.snapshot?.() ?? null;
}
