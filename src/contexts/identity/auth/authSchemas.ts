import { z } from 'zod';
import { SELF_SERVICE_ROLES } from '../../../shared/roles';
import { newPasswordSchema } from '../../../shared/password';
import { required } from '../../../shared/zodMessages';

export const registerSchema = z.object({
  name: z.string(required('Name is required')).trim().min(1, 'Name is required'),
  email: z
    .string(required('Email is required'))
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase(),
  password: newPasswordSchema,
  // What the person wants to use. Omitted means library only, as before roles existed.
  roles: z
    .array(z.enum(SELF_SERVICE_ROLES), { error: 'Roles must be a list' })
    .min(1, 'Choose at least one role')
    .optional(),
  acceptTerms: z.literal(true, { error: 'You must accept the Terms of Service and Privacy Policy' }),
});

export const loginSchema = z.object({
  email: z
    .string(required('Email is required'))
    .trim()
    .min(1, 'Email is required')
    .toLowerCase(),
  password: z.string(required('Password is required')).min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
