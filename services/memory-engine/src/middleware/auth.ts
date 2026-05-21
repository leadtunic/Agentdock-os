import type { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  agentId?: string;
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.agentId = 'anonymous';
    next();
    return;
  }

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      req.agentId = payload.agentId;
      next();
    } catch {
      req.agentId = 'anonymous';
      next();
    }
    return;
  }

  req.agentId = 'anonymous';
  next();
}

function verifyToken(token: string): { agentId: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString());
    return {
      agentId: payload.agentId ?? payload.sub ?? 'anonymous',
    };
  } catch {
    throw new Error('Invalid token');
  }
}
