import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { getSkill, listSkills } from '../services/skill-registry.js';
import { executeSkill, getExecution, listExecutions, cancelExecution } from '../services/skill-executor.js';

const router = Router();

const executeSkillSchema = z.object({
  skillId: z.string().optional(),
  skillName: z.string().optional(),
  skillVersion: z.string().optional(),
  agentId: z.string().optional(),
  sessionId: z.string().optional(),
  variables: z.record(z.unknown()).optional(),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = executeSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    if (!parsed.data.skillId && !parsed.data.skillName) {
      return res.status(400).json({ error: 'Either skillId or skillName is required' });
    }

    let skill;
    if (parsed.data.skillId) {
      skill = getSkill(parsed.data.skillId);
    } else {
      const allSkills = listSkills({ name: parsed.data.skillName });
      if (parsed.data.skillVersion) {
        skill = allSkills.find((s) => s.version === parsed.data.skillVersion);
      } else {
        skill = allSkills.find((s) => s.active);
      }
    }

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    if (!skill.active) {
      return res.status(400).json({ error: 'Skill is not active' });
    }

    const stepExecutor = async (step: { action: string; parameters: Record<string, unknown> }, variables: Record<string, unknown>) => {
      const mergedVariables = { ...variables, ...step.parameters };

      switch (step.action) {
        case 'wait': {
          const duration = (step.parameters.duration as number) ?? 1000;
          await new Promise((resolve) => setTimeout(resolve, Math.min(duration, 10000)));
          return { output: `Waited ${duration}ms`, success: true };
        }

        case 'read_file': {
          const path = step.parameters.path as string;
          if (!path) return { output: '', success: false };
          return { output: `[File content: ${path}]`, success: true };
        }

        case 'write_file': {
          const path = step.parameters.path as string;
          const content = step.parameters.content as string;
          if (!path) return { output: '', success: false };
          return { output: `Written to ${path}`, success: true };
        }

        case 'run_command': {
          const command = step.parameters.command as string;
          if (!command) return { output: '', success: false };
          return { output: `[Command output: ${command}]`, success: true };
        }

        case 'fetch_url': {
          const url = step.parameters.url as string;
          if (!url) return { output: '', success: false };
          try {
            const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
            const text = await response.text();
            return { output: text.substring(0, 1000), success: true };
          } catch {
            return { output: '', success: false };
          }
        }

        case 'search_memory': {
          const query = step.parameters.query as string;
          return { output: `[Memory search: ${query}]`, success: true };
        }

        case 'store_memory': {
          const content = step.parameters.content as string;
          return { output: `[Memory stored: ${content?.substring(0, 50)}]`, success: true };
        }

        case 'call_tool': {
          const toolName = step.parameters.toolName as string;
          return { output: `[Tool called: ${toolName}]`, success: true };
        }

        case 'send_message': {
          const content = step.parameters.content as string;
          return { output: `[Message sent: ${content?.substring(0, 50)}]`, success: true };
        }

        default:
          return { output: `Action: ${step.action}`, success: true };
      }
    };

    const execution = await executeSkill(skill, {
      agentId: parsed.data.agentId,
      sessionId: parsed.data.sessionId,
      variables: parsed.data.variables,
      stepExecutor,
    });

    const statusCode = execution.status === 'failed' ? 500 : 200;
    return res.status(statusCode).json(execution);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const execution = getExecution(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    return res.json(execution);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const skillId = typeof req.query.skillId === 'string' ? req.query.skillId : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status as Parameters<typeof listExecutions>[0] : undefined;

    const executions = listExecutions({ skillId, status });
    return res.json({ executions, total: executions.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const execution = cancelExecution(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    return res.json(execution);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
