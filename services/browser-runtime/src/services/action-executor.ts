import type { Page } from 'playwright';
import type { BrowserAction, ActionResult } from '../types.js';
import { getPage } from './browser-manager.js';

export async function executeAction(pageId: string, action: BrowserAction): Promise<ActionResult> {
  const page = getPage(pageId);
  if (!page) {
    return { success: false, error: 'Page not found', durationMs: 0 };
  }

  const start = Date.now();

  try {
    switch (action.type) {
      case 'open_url': {
        if (!action.url) {
          return { success: false, error: 'URL is required for open_url action', durationMs: Date.now() - start };
        }
        await page.goto(action.url, { waitUntil: 'networkidle', timeout: 30000 });
        return { success: true, output: page.url(), durationMs: Date.now() - start };
      }

      case 'click': {
        if (!action.selector) {
          return { success: false, error: 'Selector is required for click action', durationMs: Date.now() - start };
        }
        await page.click(action.selector, { timeout: 10000 });
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        return { success: true, output: `Clicked: ${action.selector}`, durationMs: Date.now() - start };
      }

      case 'type': {
        if (!action.selector || !action.text) {
          return { success: false, error: 'Selector and text are required for type action', durationMs: Date.now() - start };
        }
        await page.fill(action.selector, action.text, { timeout: 10000 });
        return { success: true, output: `Typed: ${action.text} into ${action.selector}`, durationMs: Date.now() - start };
      }

      case 'select': {
        if (!action.selector || !action.value) {
          return { success: false, error: 'Selector and value are required for select action', durationMs: Date.now() - start };
        }
        await page.selectOption(action.selector, action.value, { timeout: 10000 });
        return { success: true, output: `Selected: ${action.value} in ${action.selector}`, durationMs: Date.now() - start };
      }

      case 'navigate': {
        if (!action.url) {
          return { success: false, error: 'URL is required for navigate action', durationMs: Date.now() - start };
        }
        if (action.url === 'back') {
          await page.goBack({ waitUntil: 'networkidle', timeout: 30000 });
        } else if (action.url === 'forward') {
          await page.goForward({ waitUntil: 'networkidle', timeout: 30000 });
        } else {
          await page.goto(action.url, { waitUntil: 'networkidle', timeout: 30000 });
        }
        return { success: true, output: page.url(), durationMs: Date.now() - start };
      }

      case 'screenshot': {
        const screenshot = await page.screenshot({
          fullPage: action.options?.fullPage === true,
          type: 'png',
        });
        return {
          success: true,
          screenshot: screenshot.toString('base64'),
          output: 'Screenshot captured',
          durationMs: Date.now() - start,
        };
      }

      case 'snapshot': {
        const snapshot = await (page as any).accessibility?.snapshot?.() ?? null;
        const title = await page.title();
        const url = page.url();
        return {
          success: true,
          output: JSON.stringify({ title, url, accessibility: snapshot }),
          snapshot: JSON.stringify({ title, url, accessibility: snapshot }),
          durationMs: Date.now() - start,
        };
      }

      case 'scroll': {
        const direction = (action.options?.direction as string) ?? 'down';
        const amount = (action.options?.amount as number) ?? 500;

        if (direction === 'down') {
          await page.evaluate((amt) => window.scrollBy(0, amt), amount);
        } else if (direction === 'up') {
          await page.evaluate((amt) => window.scrollBy(0, -amt), amount);
        } else if (direction === 'top') {
          await page.evaluate(() => window.scrollTo(0, 0));
        } else if (direction === 'bottom') {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        }

        return { success: true, output: `Scrolled ${direction}`, durationMs: Date.now() - start };
      }

      case 'hover': {
        if (!action.selector) {
          return { success: false, error: 'Selector is required for hover action', durationMs: Date.now() - start };
        }
        await page.hover(action.selector, { timeout: 10000 });
        return { success: true, output: `Hovered: ${action.selector}`, durationMs: Date.now() - start };
      }

      case 'press_key': {
        if (!action.key) {
          return { success: false, error: 'Key is required for press_key action', durationMs: Date.now() - start };
        }
        await page.keyboard.press(action.key);
        return { success: true, output: `Pressed: ${action.key}`, durationMs: Date.now() - start };
      }

      case 'evaluate': {
        if (!action.options?.script) {
          return { success: false, error: 'Script is required for evaluate action', durationMs: Date.now() - start };
        }
        const result = await page.evaluate(action.options.script as string);
        return {
          success: true,
          output: typeof result === 'string' ? result : JSON.stringify(result),
          durationMs: Date.now() - start,
        };
      }

      default: {
        return { success: false, error: `Unknown action type: ${(action as BrowserAction).type}`, durationMs: Date.now() - start };
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message, durationMs: Date.now() - start };
  }
}
