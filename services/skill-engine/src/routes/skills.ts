import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import type { SkillDefinition, Skill } from '../types.js';
import {
  createSkill,
  getSkill,
  getSkillByName,
  listSkills,
  updateSkill,
  deleteSkill,
  toggleSkillActive,
  getSkillVersions,
} from '../services/skill-registry.js';
import { validateSkillDefinition, validateYamlSkill, validateJsonSkill } from '../services/skill-validator.js';

const router: Router = Router();

function getId(req: Request): string {
  const id = getId(req);
  return id ?? '';
}

const createSkillSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+/, 'Invalid version format'),
  instructions: z.string().min(1),
  steps: z.array(z.object({
    name: z.string().min(1),
    description: z.string(),
    action: z.string().min(1),
    parameters: z.record(z.unknown()).optional(),
    condition: z.string().optional(),
    timeout: z.number().optional(),
    retryCount: z.number().optional(),
  })),
  permissions: z.array(z.object({
    type: z.enum(['file', 'command', 'network', 'tool', 'memory', 'browser']),
    resource: z.string().min(1),
    level: z.enum(['read', 'write', 'execute', 'full']),
  })).optional(),
  tags: z.array(z.string()).optional(),
  agentIds: z.array(z.string()).optional(),
});

const updateSkillSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  instructions: z.string().min(1).optional(),
  steps: z.array(z.object({
    name: z.string().min(1),
    description: z.string(),
    action: z.string().min(1),
    parameters: z.record(z.unknown()).optional(),
    condition: z.string().optional(),
    timeout: z.number().optional(),
    retryCount: z.number().optional(),
  })).optional(),
  permissions: z.array(z.object({
    type: z.enum(['file', 'command', 'network', 'tool', 'memory', 'browser']),
    resource: z.string().min(1),
    level: z.enum(['read', 'write', 'execute', 'full']),
  })).optional(),
  tags: z.array(z.string()).optional(),
  agentIds: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const parsed = createSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const validation = validateSkillDefinition(parsed.data as unknown as SkillDefinition);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid skill definition', details: validation.errors });
    }

    const skill = createSkill(parsed.data as unknown as SkillDefinition);

    return res.status(201).json({ ...skill, validationWarnings: validation.warnings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/', (req: Request, res: Response) => {
  try {
    const agentId = typeof req.query.agentId === 'string' ? req.query.agentId : undefined;
    const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
    const tags = typeof req.query.tags === 'string' ? req.query.tags.split(',') : undefined;
    const name = typeof req.query.name === 'string' ? req.query.name : undefined;

    const filter: { agentId?: string; active?: boolean; tags?: string[]; name?: string } = {};
    if (agentId !== undefined) filter.agentId = agentId;
    if (active !== undefined) filter.active = active;
    if (tags !== undefined) filter.tags = tags;
    if (name !== undefined) filter.name = name;

    const skills = listSkills(filter);
    return res.json({ skills, total: skills.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const skill = getSkill(getId(req));
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    return res.json(skill);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

function getName(req: Request): string {
  const name = Array.isArray(req.params.name) ? req.params.name[0] : req.params.name;
  return name ?? '';
}

router.get('/name/:name', (req: Request, res: Response) => {
  try {
    const version = typeof req.query.version === 'string' ? req.query.version : undefined;
    const skill = getSkillByName(getName(req), version);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    return res.json(skill);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.get('/:id/versions', (req: Request, res: Response) => {
  try {
    const id = getId(req);
    const skill = getSkill(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const versions = getSkillVersions(skill.name);
    return res.json({ versions, total: versions.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.patch('/:id', (req: Request, res: Response) => {
  try {
    const parsed = updateSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const id = getId(req);
    const skill = updateSkill(id, parsed.data as unknown as Partial<Skill>);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    return res.json(skill);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/:id/toggle', (req: Request, res: Response) => {
  try {
    const id = getId(req);
    const skill = toggleSkillActive(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    return res.json({ id: skill.id, name: skill.name, active: skill.active });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = getId(req);
    const deleted = deleteSkill(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    return res.json({ id, deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

router.post('/validate', (req: Request, res: Response) => {
  try {
    const format = req.body.format ?? 'json';
    const content = req.body.content;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let validation;
    if (format === 'yaml') {
      validation = validateYamlSkill(content);
    } else {
      validation = validateJsonSkill(content);
    }

    return res.json(validation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

export default router;
