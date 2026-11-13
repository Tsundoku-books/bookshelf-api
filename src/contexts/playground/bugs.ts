export type BugLayer = 'api' | 'ui';

export interface Bug {
  id: string;
  layer: BugLayer;
  area: string;
}

/**
 * Every bug is functional or visual and only affects the account that switched it on. None may weaken a
 * security control or touch other users' data. The answer key lives in docs/playground-bugs.md.
 */
export const BUGS: readonly Bug[] = [
  { id: 'api-create-book-status-200', layer: 'api', area: 'books' },
  { id: 'api-stats-total-off-by-one', layer: 'api', area: 'stats' },
  { id: 'api-slow-book-list', layer: 'api', area: 'books' },
  { id: 'ui-cover-without-alt', layer: 'ui', area: 'books' },
  { id: 'ui-dashboard-title-typo', layer: 'ui', area: 'dashboard' },
];

export const BUG_IDS = BUGS.map(bug => bug.id) as [string, ...string[]];

/** True when the authenticated account switched this bug on. */
export function bugOn(req: { enabledBugs?: string[] }, id: string): boolean {
  return req.enabledBugs?.includes(id) ?? false;
}
