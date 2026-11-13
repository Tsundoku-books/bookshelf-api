# Playground bugs: answer key

Tsundoku doubles as a test-practice environment. Each user can switch on bugs for **their own account** at
`/playground` (API: `GET` and `PUT /api/playground/bugs`). A bug only changes how that account's own requests behave;
it never touches other users' data and never weakens a security control.

The screen names the area and the layer of each bug but does not say what is wrong. This file is the answer key.

| Id | Layer | Area | What is wrong | Where it lives |
|---|---|---|---|---|
| `api-create-book-status-200` | API | books | `POST /api/books` answers `200` instead of `201` | `booksController.create` |
| `api-stats-total-off-by-one` | API | stats | `GET /api/stats` reports `total` one higher than the real number of books | `statsController.overview` |
| `api-slow-book-list` | API | books | `GET /api/books` waits 3 seconds before answering | `booksController.list` |
| `ui-cover-without-alt` | UI | books | The cover images have an empty `alt`, so a screen reader announces nothing | `BookCover` |
| `ui-dashboard-title-typo` | UI | dashboard | The "My Books" heading of the dashboard is misspelled | `DashboardPage` |

## Adding a bug

1. Add it to `BUGS` in `src/contexts/playground/bugs.ts`, then to the table above.
2. Apply it with `bugOn(req, '<id>')` at the narrowest place that shows the symptom. UI bugs are applied by the
   frontend, which reads the same ids from `GET /api/playground/bugs`.
3. Add a test that proves the bug appears when it is on and does not when it is off.
4. Translate its area and title in the frontend locales (`playground.bugs.<id>`).
