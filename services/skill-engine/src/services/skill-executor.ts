import type { Skill, SkillExecution, SkillStep, StepResult, ExecutionStatus } from '../types.js';
import { config } from '../config.js';
import { hasPermission } from './skill-registry.js';

const executions = new Map<string, SkillExecution>();

export async function executeSkill(skill: Skill, context: {
  agentId?: string;
  sessionId?: string;
  variables?: Record<string, unknown>;
  stepExecutor: (step: SkillStep, variables: Record<string, unknown>) => Promise<{ output: string; success: boolean }>;
}): Promise<SkillExecution> {
  if (skill.steps.length > config.maxStepsPerSkill) {
    throw new Error(`Skill exceeds maximum step count (${skill.steps.length} > ${config.maxStepsPerSkill})`);
  }

  const execution: SkillExecution = {
    id: crypto.randomUUID(),
    skillId: skill.id,
    skillName: skill.name,
    status: 'queued',
    currentStep: 0,
    totalSteps: skill.steps.length,
    results: [],
    startedAt: new Date().toISOString(),
  };
  if (context.agentId !== undefined) {
    execution.agentId = context.agentId;
  }
  if (context.sessionId !== undefined) {
    execution.sessionId = context.sessionId;
  }

  executions.set(execution.id, execution);

  const executionTimeout = setTimeout(() => {
    if (execution.status === 'running') {
      execution.status = 'failed';
      execution.error = 'Execution timed out';
      execution.completedAt = new Date().toISOString();
    }
  }, config.maxExecutionTimeSeconds * 1000);

  try {
    execution.status = 'running';
    const variables = { ...(context.variables ?? {}) };

    for (let i = 0; i < skill.steps.length; i++) {
      const step = skill.steps[i]!;
      execution.currentStep = i + 1;

      if (step.condition && !evaluateCondition(step.condition, variables)) {
        execution.results.push({
          stepId: step.id,
          stepName: step.name,
          status: 'skipped',
          output: 'Condition not met',
          durationMs: 0,
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      const stepResult = await executeStep(step, variables, context.stepExecutor);
      execution.results.push(stepResult);

      if (stepResult.status === 'failed') {
        const maxRetries = step.retryCount ?? 0;
        let retryCount = 0;

        while (retryCount < maxRetries && stepResult.status === 'failed') {
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
          const retryResult = await executeStep(step, variables, context.stepExecutor);
          if (retryResult.status === 'completed') {
            execution.results[execution.results.length - 1] = retryResult;
            break;
          }
        }

        if (execution.results[execution.results.length - 1]?.status === 'failed') {
          execution.status = 'failed';
          execution.error = `Step "${step.name}" failed`;
          execution.completedAt = new Date().toISOString();
          clearTimeout(executionTimeout);
          return execution;
        }
      }
    }

    execution.status = 'completed';
    execution.completedAt = new Date().toISOString();
  } catch (error) {
    execution.status = 'failed';
    execution.error = error instanceof Error ? error.message : String(error);
    execution.completedAt = new Date().toISOString();
  } finally {
    clearTimeout(executionTimeout);
  }

  return execution;
}

async function executeStep(
  step: SkillStep,
  variables: Record<string, unknown>,
  executor: (step: SkillStep, variables: Record<string, unknown>) => Promise<{ output: string; success: boolean }>,
): Promise<StepResult> {
  const start = Date.now();

  try {
    const timeout = step.timeout ?? config.defaultStepTimeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Step timed out after ${timeout}s`)), timeout * 1000);
    });

    const result = await Promise.race([executor(step, variables), timeoutPromise]);

    if (result.success) {
      Object.assign(variables, { [`step_${step.name}`]: result.output });
    }

    const stepResult: StepResult = {
      stepId: step.id,
      stepName: step.name,
      status: result.success ? 'completed' : 'failed',
      output: result.output,
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
    if (!result.success) {
      stepResult.error = 'Step executor returned failure';
    }
    return stepResult;
  } catch (error) {
    return {
      stepId: step.id,
      stepName: step.name,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  }
}

function evaluateCondition(condition: string, variables: Record<string, unknown>): boolean {
  try {
    const evaluated = condition.replace(/\$\{(\w+)\}/g, (_match, key) => {
      const value = variables[key];
      return value !== undefined ? String(value) : 'undefined';
    });

    return Function(`"use strict"; return (${evaluated})`)();
  } catch {
    return false;
  }
}

export function getExecution(id: string): SkillExecution | undefined {
  return executions.get(id);
}

export function listExecutions(filter?: { skillId?: string; status?: ExecutionStatus }): SkillExecution[] {
  let result = Array.from(executions.values());

  if (filter?.skillId) {
    result = result.filter((e) => e.skillId === filter.skillId);
  }

  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }

  return result.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function cancelExecution(id: string): SkillExecution | undefined {
  const execution = executions.get(id);
  if (!execution) return undefined;

  if (['queued', 'running'].includes(execution.status)) {
    execution.status = 'cancelled';
    execution.completedAt = new Date().toISOString();
  }

  return execution;
}

export function getExecutionCount(): number {
  return executions.size;
}

export function getActiveExecutionCount(): number {
  return Array.from(executions.values()).filter((e) =>
    ['queued', 'running'].includes(e.status),
  ).length;
}
