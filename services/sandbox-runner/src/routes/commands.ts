import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import type { SandboxConfig, SandboxStatus } from '../types.js';
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

const router: Router = Router();

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

    const sandboxConfig: Partial<SandboxConfig> = {};
    if (parsed.data.workingDir !== undefined) sandboxConfig.workingDir = parsed.data.workingDir;
    if (parsed.data.allowedPaths !== undefined) sandboxConfig.allowedPaths = parsed.data.allowedPaths;
    if (parsed.data.blockedCommands !== undefined) sandboxConfig.blockedCommands = parsed.data.blockedCommands;
    if (parsed.data.maxMemoryMb !== undefined) sandboxConfig.maxMemoryMb = parsed.data.maxMemoryMb;
    if (parsed.data.timeoutSeconds !== undefined) sandboxConfig.timeoutSeconds = parsed.data.timeoutSeconds;

    const sandbox = createSandbox(sandboxConfig);
    updateSandboxStatus(sandbox.id, 'idle');

    return res.status(201).json(sandbox);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status as SandboxStatus : undefined;
    const filter: { status?: SandboxStatus } = {};
    if (status !== undefined) {
      filter.status = status;
    }
    const sandboxes = listSandboxes(filter);
    return res.json({ sandboxes, total: sandboxes.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Sandbox ID is required' });
    }
    const sandbox = getSandbox(id);
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
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Sandbox ID is required' });
    }
    const sandbox = closeSandbox(id);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }
    return res.json({ id, status: 'closed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Sandbox ID is required' });
    }
    closeSandbox(id);
    const deleted = deleteSandbox(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }
    return res.json({ id, deleted: true });
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
