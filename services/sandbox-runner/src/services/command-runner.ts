import { spawn } from 'child_process';
import type { CommandResult, CommandRequest, SandboxSession } from '../types.js';
import { config } from '../config.js';
import { isPathAllowed } from './file-access.js';

const DANGEROUS_COMMANDS = [
  'rm -rf',
  'rm -r /',
  'sudo',
  'su ',
  'mkfs',
  'dd ',
  'chmod 777',
  'chmod -R 777',
  'kill ',
  'killall',
  'wget',
  'curl |',
  'curl | bash',
  'curl | sh',
  '> /dev/',
  '> /etc/',
  '> /usr/',
  'mkfifo',
  'nc ',
  'ncat',
  'netcat',
  '/dev/tcp',
  'eval',
  'exec',
  '`',
];

export function validateCommand(command: string, sandbox: SandboxSession): { valid: boolean; reason?: string } {
  const fullCommand = `${command} ${(sandbox as SandboxSession & { args?: string[] }).args ?? []}`.trim();

  for (const dangerous of DANGEROUS_COMMANDS) {
    if (fullCommand.includes(dangerous)) {
      return { valid: false, reason: `Command contains blocked pattern: ${dangerous}` };
    }
  }

  for (const blocked of sandbox.blockedCommands) {
    if (fullCommand.includes(blocked.trim())) {
      return { valid: false, reason: `Command is blocked by sandbox policy: ${blocked.trim()}` };
    }
  }

  return { valid: true };
}

export async function runCommand(
  sandbox: SandboxSession,
  request: CommandRequest,
): Promise<CommandResult> {
  const validation = validateCommand(request.command, sandbox);
  if (!validation.valid) {
    return {
      success: false,
      stdout: '',
      stderr: validation.reason ?? 'Command blocked',
      exitCode: 1,
      durationMs: 0,
      timedOut: false,
    };
  }

  const cwd = request.cwd ?? sandbox.workingDir;
  const timeout = Math.min(request.timeout ?? sandbox.timeoutSeconds * 1000, config.maxTimeoutSeconds * 1000);

  const env = {
    ...process.env,
    HOME: sandbox.workingDir,
    TMPDIR: sandbox.workingDir,
    ...(request.env ?? {}),
  };

  return new Promise((resolve) => {
    const start = Date.now();
    let timedOut = false;

    const proc = spawn(request.command, request.args ?? [], {
      cwd,
      env,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    const stdoutHandler = (data: Buffer) => {
      stdout += data.toString();
      if (stdout.length > 100000) {
        stdout = stdout.substring(0, 100000) + '\n... [truncated]';
        proc.kill();
      }
    };

    const stderrHandler = (data: Buffer) => {
      stderr += data.toString();
      if (stderr.length > 100000) {
        stderr = stderr.substring(0, 100000) + '\n... [truncated]';
        proc.kill();
      }
    };

    proc.stdout?.on('data', stdoutHandler);
    proc.stderr?.on('data', stderrHandler);

    const timeoutId = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, timeout);

    proc.on('close', (exitCode) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - start;

      resolve({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode: exitCode ?? -1,
        durationMs: duration,
        timedOut,
      });
    });

    proc.on('error', (error) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - start;

      resolve({
        success: false,
        stdout,
        stderr: error.message,
        exitCode: -1,
        durationMs: duration,
        timedOut: false,
      });
    });
  });
}

export async function runCommandWithLimits(
  sandbox: SandboxSession,
  request: CommandRequest,
): Promise<CommandResult> {
  const result = await runCommand(sandbox, request);

  if (result.durationMs > sandbox.timeoutSeconds * 1000) {
    result.timedOut = true;
    result.stderr += `\nCommand exceeded timeout of ${sandbox.timeoutSeconds}s`;
  }

  return result;
}
