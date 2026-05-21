import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import {
  createSandbox,
  getSandbox,
  listSandboxes,
  updateSandboxStatus,
  closeSandbox,
  deleteSandbox,
  incrementCommandCount,
} from '../services/sandbox-manager.js';
import { validateCommand, runCommandWithLimits } from '../services/command-runner.js';

const router = Router();

const createSandboxSchema = z.object({
  workingDir: z.string().optional(),
  allowedPaths: z.array(z.string()).optional(),
  blockedCommands: z.array(z.string()).optional(),
  maxMemoryMb: z.number().optional(),
  timeoutSeconds: z.number().optional(),
});

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const parsed = createSandboxSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const sandbox = createSandbox(parsed.data);
    updateSandboxStatus(sandbox.id, 'idle');

    return res.status(201).json(sandbox);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status as Parameters<typeof listSandboxes>[0] : undefined;
    const sandboxes = listSandboxes({ status });
    return res.json({ sandboxes, total: sandboxes.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const sandbox = getSandbox(req.params.id);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }
    return res.json(sandbox);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/:id/close', (req: Request, res: Response) => {
  try {
    const sandbox = closeSandbox(req.params.id);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }
    return res.json({ id: req.params.id, status: 'closed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    closeSandbox(req.params.id);
    const deleted = deleteSandbox(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }
    return res.json({ id: req.params.id, deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/validate', (req: Request, res: Response) => {
  try {
    const validateSchema = z.object({
      command: z.string().min(1),
      sandboxId: z.string().optional(),
    });

    const parsed = validateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    let sandbox = parsed.data.sandboxId ? getSandbox(parsed.data.sandboxId) : undefined;
    if (!sandbox) {
      sandbox = createSandbox();
    }

    const validation = validateCommand(parsed.data.command, sandbox);
    return res.json(validation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
