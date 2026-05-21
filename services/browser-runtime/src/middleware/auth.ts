import type { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  sessionId?: string;
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.sessionId = 'anonymous';
    next();
    return;
  }

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      req.sessionId = payload.sessionId;
      next();
    } catch {
      req.sessionId = 'anonymous';
      next();
    }
    return;
  }

  req.sessionId = 'anonymous';
  next();
}

function verifyToken(token: string): { sessionId: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString());
    return {
      sessionId: payload.sessionId ?? payload.sub ?? 'anonymous',
    };
  } catch {
    throw new Error('Invalid token');
  }
}
