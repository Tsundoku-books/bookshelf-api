import { z } from 'zod';

const MAX_LENGTH = 500;

/** A host is allowed when it equals an entry or is a subdomain of one. */
export const COVER_HOSTS = [
  'books.google.com',
  'books.googleusercontent.com',
  'covers.openlibrary.org',
  'upload.wikimedia.org',
  'm.media-amazon.com',
  'images-na.ssl-images-amazon.com',
  'picsum.photos',
  'placehold.co',
  'dummyimage.com',
];

function isAllowedHost(value: string): boolean {
  const host = new URL(value).hostname.toLowerCase();
  return COVER_HOSTS.some(allowed => host === allowed || host.endsWith(`.${allowed}`));
}

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
 * Covers are shown to every user through the shared catalog, so only web links on known image hosts
 * are accepted: an arbitrary host would learn the IP and browser of everyone who opens the book.
 * Blank means "clear the cover" and is left to the caller.
 */
export const coverUrlSchema = z
  .string()
  .trim()
  .max(MAX_LENGTH, `Cover URL must be at most ${MAX_LENGTH} characters`)
  .refine(value => value === '' || isHttpUrl(value), 'Cover URL must be a valid http(s) link')
  .refine(
    value => value === '' || !isHttpUrl(value) || isAllowedHost(value),
    `Cover URL must be hosted on one of: ${COVER_HOSTS.join(', ')}`,
  )
  // The app is served over https, where plain http images are blocked as mixed content anyway.
  .transform(value => value.replace(/^http:\/\//i, 'https://'));
