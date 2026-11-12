import { Router } from 'express';
import { asyncHandler } from '../../../shared/asyncHandler';
import { createRateLimiter, emailKey } from '../../../middlewares/rateLimit';
import { validate } from '../../../middlewares/validate';
import { authController } from './authController';
import { loginSchema, registerSchema } from './authSchemas';

const router = Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.',
});

const loginByEmailLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again later.',
  keyGenerator: emailKey,
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many accounts created. Please try again later.',
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already registered
 *       429:
 *         description: Too many requests (production only)
 */
router.post(
  '/register',
  registerLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests (production only)
 */
router.post(
  '/login',
  loginLimiter,
  loginByEmailLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

export default router;
