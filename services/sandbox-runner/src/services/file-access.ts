import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, mkdirSync } from 'fs';
import { join, resolve, relative } from 'path';
import type { SandboxSession, FileOperation } from '../types.js';
import { config } from '../config.js';

export function isPathAllowed(path: string, sandbox: SandboxSession): { allowed: boolean; reason?: string } {
  const resolvedPath = resolve(path);

  for (const allowedPath of sandbox.allowedPaths) {
    const resolvedAllowed = resolve(allowedPath.trim());
    if (resolvedPath.startsWith(resolvedAllowed)) {
      return { allowed: true };
    }
  }

  const blockedPrefixes = ['/etc', '/usr/bin', '/usr/sbin', '/bin', '/sbin', '/var', '/root', '/home'];
  for (const prefix of blockedPrefixes) {
    if (resolvedPath.startsWith(prefix) && resolvedPath !== sandbox.workingDir && !resolvedPath.startsWith(sandbox.workingDir)) {
      return { allowed: false, reason: `Path ${resolvedPath} is outside allowed directories` };
    }
  }

  return { allowed: false, reason: `Path ${resolvedPath} is not within allowed paths` };
}

export function validateFileOperation(operation: FileOperation, sandbox: SandboxSession): FileOperation {
  const pathCheck = isPathAllowed(operation.path, sandbox);

  const result: FileOperation = {
    ...operation,
    allowed: pathCheck.allowed,
  };
  if (pathCheck.reason !== undefined) {
    result.reason = pathCheck.reason;
  }
  return result;
}

export function readFile(path: string, sandbox: SandboxSession): { success: boolean; content?: string; error?: string } {
  const validation = validateFileOperation({ path, operation: 'read', allowed: false }, sandbox);
  if (!validation.allowed) {
    const result: { success: boolean; error?: string } = { success: false };
    if (validation.reason !== undefined) {
      result.error = validation.reason;
    }
    return result;
  }

  try {
    const resolvedPath = resolve(path);
    const stat = statSync(resolvedPath);

    if (stat.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File too large (max 10MB)' };
    }

    const content = readFileSync(resolvedPath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read file',
    };
  }
}

export function writeFile(path: string, content: string, sandbox: SandboxSession): { success: boolean; error?: string } {
  const validation = validateFileOperation({ path, operation: 'write', allowed: false }, sandbox);
  if (!validation.allowed) {
    const result: { success: boolean; error?: string } = { success: false };
    if (validation.reason !== undefined) {
      result.error = validation.reason;
    }
    return result;
  }

  if (content.length > 5 * 1024 * 1024) {
    return { success: false, error: 'Content too large (max 5MB)' };
  }

  try {
    const resolvedPath = resolve(path);
    const dir = resolvedPath.substring(0, resolvedPath.lastIndexOf('/'));

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(resolvedPath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to write file',
    };
  }
}

export function listDirectory(path: string, sandbox: SandboxSession): { success: boolean; files?: string[]; error?: string } {
  const validation = validateFileOperation({ path, operation: 'list', allowed: false }, sandbox);
  if (!validation.allowed) {
    const result: { success: boolean; error?: string } = { success: false };
    if (validation.reason !== undefined) {
      result.error = validation.reason;
    }
    return result;
  }

  try {
    const resolvedPath = resolve(path);
    const entries = readdirSync(resolvedPath);
    return { success: true, files: entries };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list directory',
    };
  }
}

export function deleteFile(path: string, sandbox: SandboxSession): { success: boolean; error?: string } {
  const validation = validateFileOperation({ path, operation: 'delete', allowed: false }, sandbox);
  if (!validation.allowed) {
    const result: { success: boolean; error?: string } = { success: false };
    if (validation.reason !== undefined) {
      result.error = validation.reason;
    }
    return result;
  }

  try {
    const resolvedPath = resolve(path);
    unlinkSync(resolvedPath);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file',
    };
  }
}

export function fileExists(path: string, sandbox: SandboxSession): { exists: boolean; isDirectory?: boolean; error?: string } {
  const validation = validateFileOperation({ path, operation: 'exists', allowed: false }, sandbox);
  if (!validation.allowed) {
    const result: { exists: boolean; error?: string } = { exists: false };
    if (validation.reason !== undefined) {
      result.error = validation.reason;
    }
    return result;
  }

  try {
    const resolvedPath = resolve(path);
    const exists = existsSync(resolvedPath);
    const isDirectory = exists ? statSync(resolvedPath).isDirectory() : false;
    return { exists, isDirectory };
  } catch {
    return { exists: false };
  }
}

export function getFileInfo(path: string, sandbox: SandboxSession): { success: boolean; info?: Record<string, unknown>; error?: string } {
  const validation = validateFileOperation({ path, operation: 'read', allowed: false }, sandbox);
  if (!validation.allowed) {
    const result: { success: boolean; error?: string } = { success: false };
    if (validation.reason !== undefined) {
      result.error = validation.reason;
    }
    return result;
  }

  try {
    const resolvedPath = resolve(path);
    const stat = statSync(resolvedPath);
    return {
      success: true,
      info: {
        path: resolvedPath,
        size: stat.size,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        createdAt: stat.birthtime.toISOString(),
        modifiedAt: stat.mtime.toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get file info',
    };
  }
}
