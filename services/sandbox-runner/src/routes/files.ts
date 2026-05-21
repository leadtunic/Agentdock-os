import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { getSandbox, incrementFileAccessCount } from '../services/sandbox-manager.js';
import {
  readFile,
  writeFile,
  listDirectory,
  deleteFile,
  fileExists,
  getFileInfo,
  isPathAllowed,
} from '../services/file-access.js';
import { runCommandWithLimits } from '../services/command-runner.js';
import type { CommandRequest } from '../types.js';

const router: Router = Router();

const readFileSchema = z.object({
  path: z.string().min(1),
  sandboxId: z.string(),
});

const writeFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  sandboxId: z.string(),
});

const listDirSchema = z.object({
  path: z.string().min(1),
  sandboxId: z.string(),
});

const deleteFileSchema = z.object({
  path: z.string().min(1),
  sandboxId: z.string(),
});

const runCommandSchema = z.object({
  command: z.string().min(1),
  sandboxId: z.string(),
  cwd: z.string().optional(),
  timeout: z.number().optional(),
  args: z.array(z.string()).optional(),
});

router.post('/read', (req: Request, res: Response) => {
  try {
    const parsed = readFileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const sandbox = getSandbox(parsed.data.sandboxId);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    const result = readFile(parsed.data.path, sandbox);
    incrementFileAccessCount(sandbox.id);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/write', (req: Request, res: Response) => {
  try {
    const parsed = writeFileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const sandbox = getSandbox(parsed.data.sandboxId);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    const result = writeFile(parsed.data.path, parsed.data.content, sandbox);
    incrementFileAccessCount(sandbox.id);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/list', (req: Request, res: Response) => {
  try {
    const parsed = listDirSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const sandbox = getSandbox(parsed.data.sandboxId);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    const result = listDirectory(parsed.data.path, sandbox);
    incrementFileAccessCount(sandbox.id);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/delete', (req: Request, res: Response) => {
  try {
    const parsed = deleteFileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const sandbox = getSandbox(parsed.data.sandboxId);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    const result = deleteFile(parsed.data.path, sandbox);
    incrementFileAccessCount(sandbox.id);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/exists', (req: Request, res: Response) => {
  try {
    const existsSchema = z.object({
      path: z.string().min(1),
      sandboxId: z.string(),
    });

    const parsed = existsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const sandbox = getSandbox(parsed.data.sandboxId);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    const result = fileExists(parsed.data.path, sandbox);
    incrementFileAccessCount(sandbox.id);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/info', (req: Request, res: Response) => {
  try {
    const infoSchema = z.object({
      path: z.string().min(1),
      sandboxId: z.string(),
    });

    const parsed = infoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const sandbox = getSandbox(parsed.data.sandboxId);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    const result = getFileInfo(parsed.data.path, sandbox);
    incrementFileAccessCount(sandbox.id);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/check-path', (req: Request, res: Response) => {
  try {
    const checkSchema = z.object({
      path: z.string().min(1),
      sandboxId: z.string(),
    });

    const parsed = checkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const sandbox = getSandbox(parsed.data.sandboxId);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    const result = isPathAllowed(parsed.data.path, sandbox);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/run', async (req: Request, res: Response) => {
  try {
    const parsed = runCommandSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const sandbox = getSandbox(parsed.data.sandboxId);
    if (!sandbox) {
      return res.status(404).json({ error: 'Sandbox not found' });
    }

    const commandRequest: CommandRequest = {
      command: parsed.data.command,
    };
    if (parsed.data.args !== undefined) {
      commandRequest.args = parsed.data.args;
    }
    if (parsed.data.cwd !== undefined) {
      commandRequest.cwd = parsed.data.cwd;
    }
    if (parsed.data.timeout !== undefined) {
      commandRequest.timeout = parsed.data.timeout;
    }

    const result = await runCommandWithLimits(sandbox, commandRequest);

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
