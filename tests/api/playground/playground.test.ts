import { ApiClient } from '../../helpers/apiClient';
import { TestDataBuilder } from '../../helpers/testDataBuilder';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  closeTestDatabase,
} from '../../setup/testDatabase';

async function signUp() {
  const api = new ApiClient();
  const response = await api.register(TestDataBuilder.createUser());
  api.setToken(response.body.token);
  return api;
}

const enable = (api: ApiClient, ...enabled: string[]) => api.call('put', '/playground/bugs', { enabled });

describe('playground bugs', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it('requires a token', async () => {
    expect((await new ApiClient().call('get', '/playground/bugs')).status).toBe(401);
  });

  it('lists the catalog with every bug off by default', async () => {
    const api = await signUp();

    const response = await api.call('get', '/playground/bugs');

    expect(response.status).toBe(200);
    expect(response.body.bugs.length).toBeGreaterThan(0);
    expect(response.body.bugs.every((bug: { enabled: boolean }) => bug.enabled === false)).toBe(true);
    expect(Object.keys(response.body.bugs[0]).sort()).toEqual(['area', 'enabled', 'id', 'layer']);
  });

  it('switches bugs on and off, replacing the whole set', async () => {
    const api = await signUp();

    const on = await enable(api, 'api-create-book-status-200', 'api-create-book-status-200', 'ui-cover-without-alt');
    const enabledIds = (body: { bugs: { id: string; enabled: boolean }[] }) =>
      body.bugs.filter(bug => bug.enabled).map(bug => bug.id).sort();

    expect(on.status).toBe(200);
    expect(enabledIds(on.body)).toEqual(['api-create-book-status-200', 'ui-cover-without-alt']);
    expect(enabledIds((await api.call('get', '/playground/bugs')).body)).toEqual([
      'api-create-book-status-200',
      'ui-cover-without-alt',
    ]);

    const off = await enable(api);
    expect(enabledIds(off.body)).toEqual([]);
  });

  it('rejects an unknown bug and unexpected fields', async () => {
    const api = await signUp();

    expect((await enable(api, 'does-not-exist')).status).toBe(400);
    expect((await api.call('put', '/playground/bugs', { enabled: [], extra: true })).status).toBe(400);
    expect((await api.call('put', '/playground/bugs', {})).status).toBe(400);
  });

  it('answers 200 instead of 201 when a book is created with the bug on, and 201 otherwise', async () => {
    const api = await signUp();

    expect((await api.createBook(TestDataBuilder.createBook())).status).toBe(201);
    await enable(api, 'api-create-book-status-200');
    expect((await api.createBook(TestDataBuilder.createBook())).status).toBe(200);
    await enable(api);
    expect((await api.createBook(TestDataBuilder.createBook())).status).toBe(201);
  });

  it('reports one book too many in the stats with the bug on', async () => {
    const api = await signUp();
    await api.createBook(TestDataBuilder.createBook());

    const normal = await api.getStats();
    await enable(api, 'api-stats-total-off-by-one');
    const buggy = await api.getStats();

    expect(buggy.body.stats.total).toBe(normal.body.stats.total + 1);
  });

  it('delays the book list with the bug on', async () => {
    const api = await signUp();
    await enable(api, 'api-slow-book-list');

    const startedAt = Date.now();
    const response = await api.getBooks();

    expect(response.status).toBe(200);
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(2900);
  });

  it('reports one page too few with the pagination bug on', async () => {
    const api = await signUp();
    for (let i = 0; i < 3; i++) await api.createBook(TestDataBuilder.createBook());

    const normal = await api.getBooks({ limit: 2 });
    await enable(api, 'api-pagination-total-pages-floor');
    const buggy = await api.getBooks({ limit: 2 });

    expect(normal.body.pagination.totalPages).toBe(2);
    expect(buggy.body.pagination.totalPages).toBe(1);
  });

  it('ignores the status filter with the bug on', async () => {
    const api = await signUp();
    const finished = await api.createBook(TestDataBuilder.createBook());
    await api.createBook(TestDataBuilder.createBook());
    await api.updateBookStatus(finished.body.book.id, 'read');

    const normal = await api.getBooks({ status: 'read' });
    await enable(api, 'api-list-ignores-status-filter');
    const buggy = await api.getBooks({ status: 'read' });

    expect(normal.body.books).toHaveLength(1);
    expect(buggy.body.books).toHaveLength(2);
  });

  it('never affects another account', async () => {
    const buggy = await signUp();
    const other = await signUp();
    await enable(buggy, 'api-create-book-status-200', 'api-stats-total-off-by-one');

    expect((await other.createBook(TestDataBuilder.createBook())).status).toBe(201);
    expect((await other.getStats()).body.stats.total).toBe(1);
  });
});
