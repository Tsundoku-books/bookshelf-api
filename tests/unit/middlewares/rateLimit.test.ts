import express, { Request } from 'express';
import request from 'supertest';
import { createRateLimiter, emailKey, userOrIpKey } from '../../../src/middlewares/rateLimit';
import { signAuthToken } from '../../../src/shared/jwt';

function appWith(limiter: ReturnType<typeof createRateLimiter>) {
  const app = express();
  app.use(express.json());
  app.post('/hit', limiter, (_req, res) => res.json({ ok: true }));
  return app;
}

const limiterOf = (keyGenerator?: (req: Request) => string) =>
  createRateLimiter({ windowMs: 60_000, max: 2, message: 'slow down', keyGenerator, skip: () => false });

describe('createRateLimiter', () => {
  it('answers 429 RATE_LIMITED once the budget is spent', async () => {
    const app = appWith(limiterOf());

    await request(app).post('/hit').expect(200);
    await request(app).post('/hit').expect(200);
    const blocked = await request(app).post('/hit');

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: 'slow down', code: 'RATE_LIMITED' });
  });

  it('is skipped outside production by default', async () => {
    const app = appWith(createRateLimiter({ windowMs: 60_000, max: 1, message: 'x' }));

    for (let i = 0; i < 3; i++) await request(app).post('/hit').expect(200);
  });

  it('gives each signed-in user their own budget on a shared IP', async () => {
    const app = appWith(limiterOf(userOrIpKey));
    const ana = `Bearer ${signAuthToken('ana')}`;
    const bia = `Bearer ${signAuthToken('bia')}`;

    await request(app).post('/hit').set('Authorization', ana).expect(200);
    await request(app).post('/hit').set('Authorization', ana).expect(200);
    await request(app).post('/hit').set('Authorization', ana).expect(429);
    await request(app).post('/hit').set('Authorization', bia).expect(200);
  });

  it('counts an invalid token by IP instead of trusting it', async () => {
    const app = appWith(limiterOf(userOrIpKey));

    await request(app).post('/hit').set('Authorization', 'Bearer made-up-1').expect(200);
    await request(app).post('/hit').set('Authorization', 'Bearer made-up-2').expect(200);
    await request(app).post('/hit').set('Authorization', 'Bearer made-up-3').expect(429);
  });

  it('caps attempts per email no matter the case', async () => {
    const app = appWith(limiterOf(emailKey));

    await request(app).post('/hit').send({ email: 'Ana@Test.com' }).expect(200);
    await request(app).post('/hit').send({ email: ' ana@test.com ' }).expect(200);
    await request(app).post('/hit').send({ email: 'ANA@test.com' }).expect(429);
    await request(app).post('/hit').send({ email: 'bia@test.com' }).expect(200);
  });
});
