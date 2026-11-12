import { Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { env } from '../config/env';
import { verifyAuthToken } from '../shared/jwt';

// Only active in production so it never interferes with local development or the test suite.
const productionOnly = () => env.NODE_ENV !== 'production';

interface LimiterOptions {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: Request) => string;
  skip?: () => boolean;
}

export function createRateLimiter({ windowMs, max, message, keyGenerator, skip = productionOnly }: LimiterOptions) {
  return rateLimit({
    windowMs,
    max,
    message: { error: message, code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skip,
  });
}

const ipKey = (req: Request): string => `ip:${ipKeyGenerator(req.ip ?? '')}`;

/** One budget per signed-in user, so people sharing an IP (NAT, CI runners) do not drain each other's. */
export function userOrIpKey(req: Request): string {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      return `user:${verifyAuthToken(token).userId}`;
    } catch {
      // An invalid token proves nothing about who is calling, so it is counted by IP.
    }
  }
  return ipKey(req);
}

/** Counts attempts per email, so guessing one account's password from many IPs is still capped. */
export function emailKey(req: Request): string {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  return email ? `email:${email}` : ipKey(req);
}

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: 'Too many requests. Please try again later.',
  keyGenerator: userOrIpKey,
});
