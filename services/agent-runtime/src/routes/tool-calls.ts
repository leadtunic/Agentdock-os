import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  getSession,
  updateSessionStatus,
  addToolCall,
  updateToolCall,
  addTokenUsage,
  getCostRecords,
} from '../services/session-manager.js';
import { executeToolCall, executeApprovedToolCall } from '../services/tool-executor.js';
import { estimateCost } from '../services/provider-client.js';

const router: Router = Router();

const toolCallSchema = z.object({
  toolName: z.string().min(1),
  input: z.record(z.unknown()),
  requiresApproval: z.boolean().default(false),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = toolCallSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const { toolName, input, requiresApproval } = parsed.data;
    const sessionId = req.body.sessionId;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const toolCallId = crypto.randomUUID();
    addToolCall(sessionId, {
      toolName,
      input,
      requiresApproval,
    });

    const governanceCheck = async (name: string, inp: Record<string, unknown>) => {
      return { allowed: true };
    };

    const executor = async (name: string, inp: Record<string, unknown>) => {
      return { output: JSON.stringify({ tool: name, input: inp }), costUsd: 0 };
    };

    const result = await executeToolCall({
      sessionId,
      toolCallId,
      toolName,
      input,
      requiresApproval,
      governanceCheck,
      executor,
    });

    if (result.requiresApproval && !result.success) {
      updateToolCall(sessionId, toolCallId, { status: 'pending' });
      updateSessionStatus(sessionId, 'waiting_for_approval');
      return res.status(202).json({
        toolCallId,
        status: 'pending_approval',
        requiresApproval: true,
      });
    }

    if (result.success) {
      const updates: Record<string, unknown> = { status: 'completed', completedAt: new Date().toISOString() };
      if (result.output !== undefined) updates.output = result.output;
      if (result.costUsd !== undefined) updates.costUsd = result.costUsd;
      updateToolCall(sessionId, toolCallId, updates as Parameters<typeof updateToolCall>[2]);
    } else {
      const updates: Record<string, unknown> = { status: 'failed', completedAt: new Date().toISOString() };
      if (result.error !== undefined) updates.error = result.error;
      updateToolCall(sessionId, toolCallId, updates as Parameters<typeof updateToolCall>[2]);
    }

    return res.json({
      toolCallId,
      success: result.success,
      output: result.output,
      error: result.error,
      requiresApproval: result.requiresApproval,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const toolCall = session.toolCalls.find((tc) => tc.id === req.params.id);
    if (!toolCall) {
      return res.status(404).json({ error: 'Tool call not found' });
    }

    updateToolCall(sessionId, toolCall.id, {
      status: 'approved',
      approvedBy: req.body.approvedBy ?? 'user',
    });

    updateSessionStatus(sessionId, 'running');

    const executor = async (name: string, inp: Record<string, unknown>) => {
      return { output: JSON.stringify({ tool: name, input: inp }), costUsd: 0 };
    };

    const result = await executeApprovedToolCall({
      sessionId,
      toolCallId: toolCall.id,
      toolName: toolCall.toolName,
      input: toolCall.input,
      executor,
    });

    if (result.success) {
      updateToolCall(sessionId, toolCall.id, {
        status: 'completed',
        output: result.output,
        completedAt: new Date().toISOString(),
        costUsd: result.costUsd,
      });
    } else {
      updateToolCall(sessionId, toolCall.id, {
        status: 'failed',
        error: result.error,
        completedAt: new Date().toISOString(),
      });
    }

    return res.json({
      toolCallId: toolCall.id,
      success: result.success,
      output: result.output,
      error: result.error,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/:id/reject', (req: Request, res: Response) => {
  try {
    const sessionId = req.body.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const toolCall = session.toolCalls.find((tc) => tc.id === req.params.id);
    if (!toolCall) {
      return res.status(404).json({ error: 'Tool call not found' });
    }

    updateToolCall(sessionId, toolCall.id, {
      status: 'rejected',
      completedAt: new Date().toISOString(),
    });

    return res.json({ toolCallId: toolCall.id, status: 'rejected' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/cost/estimate', (req: Request, res: Response) => {
  try {
    const estimateSchema = z.object({
      provider: z.string(),
      model: z.string(),
      promptTokens: z.number(),
      completionTokens: z.number(),
    });

    const parsed = estimateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const cost = estimateCost(parsed.data.provider, parsed.data.model, {
      promptTokens: parsed.data.promptTokens,
      completionTokens: parsed.data.completionTokens,
      totalTokens: parsed.data.promptTokens + parsed.data.completionTokens,
    });

    return res.json({ costUsd: cost, provider: parsed.data.provider, model: parsed.data.model });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
