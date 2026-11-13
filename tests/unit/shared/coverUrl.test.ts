import { createBookSchema, updateBookSchema } from '../../../src/contexts/library/books/booksSchemas';
import { adminEditSchema } from '../../../src/contexts/catalog/catalogSchemas';
import { coverUrlSchema } from '../../../src/shared/coverUrl';

describe('coverUrlSchema', () => {
  it('keeps https links and upgrades plain http', () => {
    expect(coverUrlSchema.parse(' https://covers.openlibrary.org/c.jpg ')).toBe('https://covers.openlibrary.org/c.jpg');
    expect(coverUrlSchema.parse('http://covers.openlibrary.org/c.jpg')).toBe('https://covers.openlibrary.org/c.jpg');
  });

  it('accepts subdomains of an allowed host and ignores case', () => {
    expect(coverUrlSchema.parse('https://Lh3.books.googleusercontent.com/x')).toBe('https://Lh3.books.googleusercontent.com/x');
  });

  it.each([
    'https://evil.example/c.jpg',
    'https://openlibrary.org.evil.example/c.jpg',
    'https://evilplacehold.co/c.jpg',
    'https://placehold.co@evil.example/c.jpg',
  ])('rejects a host that is not on the list: %s', value => {
    expect(coverUrlSchema.safeParse(value).success).toBe(false);
  });

  it('lets a blank value through so callers can clear the cover', () => {
    expect(coverUrlSchema.parse('   ')).toBe('');
  });

  it.each([
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
    'file:///etc/passwd',
    'ftp://host/c.jpg',
    '//host/c.jpg',
    'https://',
    'not a url',
    `https://picsum.photos/${'a'.repeat(500)}`,
  ])('rejects %s', value => {
    expect(coverUrlSchema.safeParse(value).success).toBe(false);
  });
});

describe('where covers are validated', () => {
  const book = { title: 'T', author: 'A' };

  it('on create, treating blank as absent', () => {
    expect(createBookSchema.parse({ ...book, coverUrl: '  ' }).coverUrl).toBeUndefined();
    expect(createBookSchema.parse({ ...book, coverUrl: 'http://picsum.photos/c.jpg' }).coverUrl).toBe('https://picsum.photos/c.jpg');
    expect(createBookSchema.safeParse({ ...book, coverUrl: 'javascript:alert(1)' }).success).toBe(false);
  });

  it('on update, keeping null and blank as ways to clear it', () => {
    expect(updateBookSchema.parse({ coverUrl: null }).coverUrl).toBeNull();
    expect(updateBookSchema.parse({ coverUrl: '' }).coverUrl).toBe('');
    expect(updateBookSchema.safeParse({ coverUrl: 'data:text/html,x' }).success).toBe(false);
  });

  it('on admin catalog edits', () => {
    expect(adminEditSchema.parse({ coverUrl: 'https://picsum.photos/c.jpg' }).coverUrl).toBe('https://picsum.photos/c.jpg');
    expect(adminEditSchema.safeParse({ coverUrl: 'javascript:alert(1)' }).success).toBe(false);
  });
});
