import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { getSession, updateSessionStatus, setSessionUrl, addConsoleError, addNetworkError, addScreenshot } from '../services/session-manager.js';
import { createPage, getPage } from '../services/browser-manager.js';
import { executeAction } from '../services/action-executor.js';
import { captureScreenshot, getPageSnapshot, getPageAccessibilitySnapshot } from '../services/screenshot-capture.js';

const router: Router = Router();

function getSessionId(req: Request): string {
  const id = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  return id ?? '';
}

const actionSchema = z.object({
  type: z.enum(['open_url', 'click', 'type', 'select', 'navigate', 'screenshot', 'snapshot', 'scroll', 'hover', 'press_key', 'evaluate']),
  selector: z.string().optional(),
  url: z.string().optional(),
  text: z.string().optional(),
  value: z.string().optional(),
  key: z.string().optional(),
  options: z.record(z.unknown()).optional(),
});

router.post('/:sessionId', async (req: Request, res: Response) => {
  try {
    const parsed = actionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const session = getSession(getSessionId(req));
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    updateSessionStatus(getSessionId(req), 'busy');

    const page = getPage(session.profileId);
    if (!page) {
      updateSessionStatus(getSessionId(req), 'error');
      return res.status(400).json({ error: 'No active page for this session' });
    }

    const pageId = session.profileId;
    const result = await executeAction(pageId, parsed.data);

    if (parsed.data.type === 'open_url' && result.success && parsed.data.url) {
      setSessionUrl(getSessionId(req), parsed.data.url);
    }

    if (parsed.data.type === 'screenshot' && result.screenshot) {
      addScreenshot(getSessionId(req), { base64: result.screenshot });
    }

    const finalStatus = result.success ? 'idle' : 'error';
    updateSessionStatus(getSessionId(req), finalStatus);

    return res.json({
      sessionId: getSessionId(req),
      action: parsed.data.type,
      success: result.success,
      output: result.output,
      screenshot: result.screenshot,
      snapshot: result.snapshot,
      error: result.error,
      durationMs: result.durationMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/:sessionId/screenshot', async (req: Request, res: Response) => {
  try {
    const session = getSession(getSessionId(req));
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const fullPage = req.body.fullPage === true;
    const base64 = await captureScreenshot(session.profileId, { fullPage });

    if (!base64) {
      return res.status(400).json({ error: 'Failed to capture screenshot' });
    }

    addScreenshot(getSessionId(req), { base64 });

    return res.json({
      sessionId: getSessionId(req),
      screenshot: base64,
      fullPage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:sessionId/snapshot', async (req: Request, res: Response) => {
  try {
    const session = getSession(getSessionId(req));
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const snapshot = await getPageSnapshot(session.profileId);
    if (!snapshot) {
      return res.status(400).json({ error: 'Failed to get snapshot' });
    }

    return res.json({
      sessionId: getSessionId(req),
      ...snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:sessionId/accessibility', async (req: Request, res: Response) => {
  try {
    const session = getSession(getSessionId(req));
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const snapshot = await getPageAccessibilitySnapshot(session.profileId);

    return res.json({
      sessionId: getSessionId(req),
      accessibility: snapshot,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:sessionId/errors', (req: Request, res: Response) => {
  try {
    const session = getSession(getSessionId(req));
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({
      sessionId: getSessionId(req),
      consoleErrors: session.consoleErrors,
      networkErrors: session.networkErrors,
      totalErrors: session.consoleErrors.length + session.networkErrors.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
