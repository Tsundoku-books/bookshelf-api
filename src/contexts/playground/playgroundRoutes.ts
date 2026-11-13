import { Request, Response, Router } from 'express';
import { IdentityDirectory } from '../identity';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../shared/asyncHandler';
import { BUGS } from './bugs';
import { setBugsSchema } from './playgroundSchemas';

const router = Router();

router.use(authMiddleware);

const view = (enabled: string[]) => BUGS.map(bug => ({ ...bug, enabled: enabled.includes(bug.id) }));

/**
 * @swagger
 * /api/playground/bugs:
 *   get:
 *     summary: The bugs a user can switch on for their own account, and which ones are on
 *     description: Test-practice feature. A bug only changes how this account's own requests behave.
 *     tags: [Playground]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: The catalog with an `enabled` flag per bug }
 */
router.get(
  '/bugs',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ bugs: view(req.enabledBugs ?? []) });
  }),
);

/**
 * @swagger
 * /api/playground/bugs:
 *   put:
 *     summary: Replace the set of bugs switched on for the authenticated account
 *     tags: [Playground]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [enabled]
 *             properties:
 *               enabled: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: The catalog with the new state }
 *       400: { description: Unknown bug id }
 */
router.put(
  '/bugs',
  validate({ body: setBugsSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const enabled = [...new Set<string>(req.body.enabled)];
    await IdentityDirectory.setEnabledBugs(req.userId as string, enabled);
    res.json({ message: 'Bugs updated', bugs: view(enabled) });
  }),
);

export default router;
