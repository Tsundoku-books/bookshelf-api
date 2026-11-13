import { BUGS, BUG_IDS, bugOn } from '../../../src/contexts/playground/bugs';
import { setBugsSchema } from '../../../src/contexts/playground/playgroundSchemas';

describe('playground bugs', () => {
  it('has unique ids, each one with a layer and an area', () => {
    expect(new Set(BUG_IDS).size).toBe(BUGS.length);
    for (const bug of BUGS) {
      expect(['api', 'ui']).toContain(bug.layer);
      expect(bug.area).toBeTruthy();
    }
  });

  it('is on only for the ids the account switched on', () => {
    expect(bugOn({ enabledBugs: ['api-slow-book-list'] }, 'api-slow-book-list')).toBe(true);
    expect(bugOn({ enabledBugs: ['api-slow-book-list'] }, 'api-create-book-status-200')).toBe(false);
    expect(bugOn({}, 'api-slow-book-list')).toBe(false);
  });

  it('validates the body: known ids only, no extra fields', () => {
    expect(setBugsSchema.safeParse({ enabled: [] }).success).toBe(true);
    expect(setBugsSchema.safeParse({ enabled: [BUG_IDS[0]] }).success).toBe(true);
    expect(setBugsSchema.safeParse({ enabled: ['nope'] }).success).toBe(false);
    expect(setBugsSchema.safeParse({ enabled: [], other: 1 }).success).toBe(false);
    expect(setBugsSchema.safeParse({}).success).toBe(false);
  });
});
