import { z } from 'zod';

const MAX_LENGTH = 500;

function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\/\S+$/i.test(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Covers are shown to every user through the shared catalog, so only web links are accepted
 * (no javascript:, data: or file:). Blank means "clear the cover" and is left to the caller.
 */
export const coverUrlSchema = z
  .string()
  .trim()
  .max(MAX_LENGTH, `Cover URL must be at most ${MAX_LENGTH} characters`)
  .refine(value => value === '' || isHttpUrl(value), 'Cover URL must be a valid http(s) link')
  // The app is served over https, where plain http images are blocked as mixed content anyway.
  .transform(value => value.replace(/^http:\/\//i, 'https://'));
