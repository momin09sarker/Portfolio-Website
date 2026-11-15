import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from './db.ts';

export const SESSION_COOKIE_NAME = 'portfolio_admin_session';
export const CSRF_COOKIE_NAME = 'portfolio_csrf_token';

let cachedJwtSecret: string | null = null;

export function getJwtSecret(): string {
  if (cachedJwtSecret) return cachedJwtSecret;

  const envSecret = process.env.JWT_SECRET?.trim();
  if (envSecret && envSecret.length >= 32 && !envSecret.includes('REPLACE_WITH')) {
    cachedJwtSecret = envSecret;
    return cachedJwtSecret;
  }

  const secretPath = path.resolve(process.cwd(), 'data', '.jwt_secret');
  if (fs.existsSync(secretPath)) {
    const stored = fs.readFileSync(secretPath, 'utf8').trim();
    if (stored.length >= 32) {
      cachedJwtSecret = stored;
      return cachedJwtSecret;
    }
  }

  const generated = crypto.randomBytes(64).toString('hex');
  try {
    fs.writeFileSync(secretPath, generated, { mode: 0o600 });
  } catch {
    // Fallback to in-memory generated secret if filesystem is read-only
  }
  cachedJwtSecret = generated;
  return cachedJwtSecret;
}

export function isHttpsRequest(req: Request): boolean {
  if (req.secure) return true;
  const proto = req.headers['x-forwarded-proto'];
  if (typeof proto === 'string') {
    return proto.split(',')[0].trim() === 'https';
  }
  return false;
}

export function getCookieOptions(req: Request, maxAgeMs: number) {
  const secure = isHttpsRequest(req);
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function ensureCsrfToken(req: Request, res: Response): string {
  const existing = req.cookies?.[CSRF_COOKIE_NAME];
  if (typeof existing === 'string' && /^[a-f0-9]{64}$/.test(existing)) {
    return existing;
  }
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, token, getCookieOptions(req, 12 * 60 * 60 * 1000));
  return token;
}

export function rotateCsrfToken(req: Request, res: Response): string {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, token, getCookieOptions(req, 12 * 60 * 60 * 1000));
  return token;
}

export function verifyCsrf(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'];

  if (
    typeof cookieToken !== 'string' ||
    typeof headerToken !== 'string' ||
    cookieToken.length !== 64 ||
    headerToken.length !== 64
  ) {
    res.status(403).json({ error: 'Invalid or missing security token. Please refresh and try again.' });
    return;
  }

  const cookieBuf = Buffer.from(cookieToken, 'utf8');
  const headerBuf = Buffer.from(headerToken, 'utf8');

  if (cookieBuf.length !== headerBuf.length || !crypto.timingSafeEqual(cookieBuf, headerBuf)) {
    res.status(403).json({ error: 'Security token mismatch. Please refresh and try again.' });
    return;
  }

  next();
}

export interface AdminSessionRequest extends Request {
  adminUser?: {
    id: number;
    username: string;
  };
}

export function requireAdminAuth(
  req: AdminSessionRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (typeof token !== 'string' || !token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    }) as { sub: string; username: string };

    const adminId = Number(decoded.sub);
    if (!Number.isInteger(adminId) || adminId <= 0) {
      res.status(401).json({ error: 'Invalid session.' });
      return;
    }

    const row = db
      .prepare('SELECT id, username FROM admin_users WHERE id = ?')
      .get(adminId) as { id: number; username: string } | undefined;

    if (!row) {
      res.status(401).json({ error: 'Session expired.' });
      return;
    }

    req.adminUser = { id: row.id, username: row.username };
    next();
  } catch {
    res.status(401).json({ error: 'Session expired or invalid.' });
  }
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  const hits = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = crypto.createHash('sha256').update(rawIp).digest('hex');
    const now = Date.now();
    const cutoff = now - options.windowMs;

    const existing = (hits.get(key) || []).filter((ts) => ts > cutoff);
    if (existing.length >= options.max) {
      res.status(429).json({ error: options.message });
      return;
    }

    existing.push(now);
    hits.set(key, existing);

    if (hits.size > 5000) {
      for (const [k, timestamps] of hits.entries()) {
        if (timestamps.every((ts) => ts <= cutoff)) {
          hits.delete(k);
        }
      }
    }

    next();
  };
}

export function hashIp(req: Request): string {
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
  return crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 16);
}

export function sanitizeSingleLine(input: string, maxLen = 300): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeMultiline(input: string, maxLen = 5000): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) {
    return trimmed.slice(0, 500);
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString().slice(0, 500);
    }
    return '';
  } catch {
    return '';
  }
}

export function detectImageExtension(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}
