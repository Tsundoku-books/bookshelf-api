import { createBookSchema, updateBookSchema } from '../../../src/contexts/library/books/booksSchemas';
import { adminEditSchema } from '../../../src/contexts/catalog/catalogSchemas';
import { coverUrlSchema } from '../../../src/shared/coverUrl';

describe('coverUrlSchema', () => {
  it('keeps https links and upgrades plain http', () => {
    expect(coverUrlSchema.parse(' https://books.example/c.jpg ')).toBe('https://books.example/c.jpg');
    expect(coverUrlSchema.parse('http://books.example/c.jpg')).toBe('https://books.example/c.jpg');
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
    `https://host/${'a'.repeat(500)}`,
  ])('rejects %s', value => {
    expect(coverUrlSchema.safeParse(value).success).toBe(false);
  });
});

describe('where covers are validated', () => {
  const book = { title: 'T', author: 'A' };

  it('on create, treating blank as absent', () => {
    expect(createBookSchema.parse({ ...book, coverUrl: '  ' }).coverUrl).toBeUndefined();
    expect(createBookSchema.parse({ ...book, coverUrl: 'http://h/c.jpg' }).coverUrl).toBe('https://h/c.jpg');
    expect(createBookSchema.safeParse({ ...book, coverUrl: 'javascript:alert(1)' }).success).toBe(false);
  });

  it('on update, keeping null and blank as ways to clear it', () => {
    expect(updateBookSchema.parse({ coverUrl: null }).coverUrl).toBeNull();
    expect(updateBookSchema.parse({ coverUrl: '' }).coverUrl).toBe('');
    expect(updateBookSchema.safeParse({ coverUrl: 'data:text/html,x' }).success).toBe(false);
  });

  it('on admin catalog edits', () => {
    expect(adminEditSchema.parse({ coverUrl: 'https://h/c.jpg' }).coverUrl).toBe('https://h/c.jpg');
    expect(adminEditSchema.safeParse({ coverUrl: 'javascript:alert(1)' }).success).toBe(false);
  });
});
