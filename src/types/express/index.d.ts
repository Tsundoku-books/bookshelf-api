/**
 * Adds the authenticated user id (populated by `authMiddleware`) to Express'
 * request type so controllers can read `req.userId` without casts.
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      /** Exact bytes of the body; kept only for the payment webhook, whose signature covers them. */
      rawBody?: Buffer;
      userRoles?: import('../../shared/roles').Role[];
    }
  }
}

export {};
