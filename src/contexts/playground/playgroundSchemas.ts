import { z } from 'zod';
import { BUG_IDS } from './bugs';

export const setBugsSchema = z
  .object({
    enabled: z.array(z.enum(BUG_IDS)).max(BUG_IDS.length),
  })
  .strict();

export type SetBugsInput = z.infer<typeof setBugsSchema>;
