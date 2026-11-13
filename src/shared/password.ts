import { z } from 'zod';
import { required } from './zodMessages';

export const MIN_PASSWORD_LENGTH = 8;
// bcrypt only reads the first 72 bytes, so a longer password would silently lose its tail.
export const MAX_PASSWORD_BYTES = 72;

export const newPasswordSchema = z
  .string(required('Password is required'))
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
  .refine(value => Buffer.byteLength(value) <= MAX_PASSWORD_BYTES, {
    message: `Password must be at most ${MAX_PASSWORD_BYTES} bytes long`,
  });
