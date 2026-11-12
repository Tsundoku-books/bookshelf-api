import { NextFunction, Request, Response } from 'express';
import { IdentityDirectory } from '../contexts/identity/directory';
import { UserStatus } from '../contexts/identity/models/User';
import { ForbiddenError, UnauthorizedError } from '../shared/errors';
import { verifyAuthToken } from '../shared/jwt';

/**
 * Roles and status come from the database, not from the token: a suspended, deleted or demoted
 * account loses access at once instead of when its (7 day) token expires.
 */
export const authMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Authentication token not provided', 'TOKEN_MISSING');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Malformed authentication token', 'TOKEN_MALFORMED');
    }

    const { userId } = verifyAuthToken(token);
    const account = await IdentityDirectory.accountState(userId);
    if (!account) {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }
    if (account.status === UserStatus.SUSPENDED) {
      throw new ForbiddenError('This account is suspended', 'ACCOUNT_SUSPENDED');
    }

    req.userId = account.id;
    req.userRoles = account.roles;
    next();
  } catch (error) {
    next(error);
  }
};
