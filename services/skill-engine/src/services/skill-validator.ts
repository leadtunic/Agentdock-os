import type { SkillDefinition, SkillPermission, PermissionType, PermissionLevel } from '../types.js';
import { config } from '../config.js';

const ALLOWED_ACTIONS = new Set([
  'read_file',
  'write_file',
  'run_command',
  'fetch_url',
  'search_memory',
  'store_memory',
  'click_element',
  'type_text',
  'navigate_url',
  'take_screenshot',
  'call_tool',
  'send_message',
  'wait',
  'condition',
  'loop',
]);

const ALLOWED_PERMISSION_TYPES: PermissionType[] = ['file', 'command', 'network', 'tool', 'memory', 'browser'];
const ALLOWED_PERMISSION_LEVELS: PermissionLevel[] = ['read', 'write', 'execute', 'full'];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSkillDefinition(definition: SkillDefinition): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!definition.name || definition.name.trim().length === 0) {
    errors.push('Skill name is required');
  }

  if (!definition.description || definition.description.trim().length === 0) {
    errors.push('Skill description is required');
  }

  if (!definition.version || !isValidVersion(definition.version)) {
    errors.push('Invalid version format. Use semver (e.g., 1.0.0)');
  }

  if (!definition.instructions || definition.instructions.trim().length === 0) {
    errors.push('Skill instructions are required');
  }

  if (!definition.steps || definition.steps.length === 0) {
    errors.push('At least one step is required');
  }

  if (definition.steps.length > config.maxStepsPerSkill) {
    errors.push(`Too many steps: ${definition.steps.length} > ${config.maxStepsPerSkill}`);
  }

  for (let i = 0; i < definition.steps.length; i++) {
    const step = definition.steps[i]!;
    const stepNum = i + 1;

    if (!step.name || step.name.trim().length === 0) {
      errors.push(`Step ${stepNum}: name is required`);
    }

    if (!step.action || step.action.trim().length === 0) {
      errors.push(`Step ${stepNum}: action is required`);
    } else if (!ALLOWED_ACTIONS.has(step.action)) {
      warnings.push(`Step ${stepNum}: unknown action "${step.action}"`);
    }

    if (step.timeout !== undefined && (step.timeout < 1 || step.timeout > 300)) {
      errors.push(`Step ${stepNum}: timeout must be between 1 and 300 seconds`);
    }

    if (step.retryCount !== undefined && (step.retryCount < 0 || step.retryCount > 5)) {
      errors.push(`Step ${stepNum}: retryCount must be between 0 and 5`);
    }
  }

  for (let i = 0; i < definition.permissions.length; i++) {
    const perm = definition.permissions[i]!;
    const permNum = i + 1;

    if (!ALLOWED_PERMISSION_TYPES.includes(perm.type)) {
      errors.push(`Permission ${permNum}: invalid type "${perm.type}"`);
    }

    if (!ALLOWED_PERMISSION_LEVELS.includes(perm.level)) {
      errors.push(`Permission ${permNum}: invalid level "${perm.level}"`);
    }

    if (!perm.resource || perm.resource.trim().length === 0) {
      errors.push(`Permission ${permNum}: resource is required`);
    }
  }

  if (definition.tags && definition.tags.length > 20) {
    warnings.push('Too many tags (max 20)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validatePermissions(permissions: SkillPermission[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const perm of permissions) {
    if (!ALLOWED_PERMISSION_TYPES.includes(perm.type)) {
      errors.push(`Invalid permission type: ${perm.type}`);
    }

    if (!ALLOWED_PERMISSION_LEVELS.includes(perm.level)) {
      errors.push(`Invalid permission level: ${perm.level}`);
    }

    if (perm.type === 'command' && perm.level === 'full') {
      warnings.push('Full command execution permission is a security risk');
    }

    if (perm.resource === '*' && perm.level === 'full') {
      warnings.push('Wildcard resource with full access is a security risk');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateYamlSkill(content: string): ValidationResult {
  try {
    const parsed = parseYamlLike(content);
    return validateSkillDefinition(parsed as unknown as SkillDefinition);
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`],
      warnings: [],
    };
  }
}

export function validateJsonSkill(content: string): ValidationResult {
  try {
    const parsed = JSON.parse(content);
    return validateSkillDefinition(parsed as SkillDefinition);
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`],
      warnings: [],
    };
  }
}

function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+/.test(version);
}

function parseYamlLike(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');

  let currentKey = '';
  let currentObj: Record<string, unknown> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (!line.startsWith(' ') && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      currentKey = key!;

      if (value === '' || value === '|' || value === '>') {
        currentObj = {};
        result[currentKey] = currentObj;
      } else {
        result[currentKey] = parseValue(value);
        currentObj = null;
      }
    } else if (currentObj && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      currentObj[key!] = parseValue(value);
    }
  }

  return result;
}

function parseValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}
