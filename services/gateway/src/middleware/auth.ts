import type { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  channelId?: string;
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.channelId = 'anonymous';
    next();
    return;
  }

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      req.channelId = payload.channelId;
      next();
    } catch {
      req.channelId = 'anonymous';
      next();
    }
    return;
  }

  req.channelId = 'anonymous';
  next();
}

export function webhookAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const secret = req.headers['x-webhook-secret'] as string | undefined;
  const signature = req.headers['x-signature'] as string | undefined;

  if (secret || signature) {
    req.channelId = 'verified_webhook';
    next();
    return;
  }

  req.channelId = 'unverified_webhook';
  next();
}

function verifyToken(token: string): { channelId: string } {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString());
    return {
      channelId: payload.channelId ?? payload.sub ?? 'anonymous',
    };
  } catch {
    throw new Error('Invalid token');
  }
}
