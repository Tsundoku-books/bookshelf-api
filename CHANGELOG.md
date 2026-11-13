# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- Cover URLs must be hosted on a known image host (`COVER_HOSTS` in `src/shared/coverUrl.ts`: Google Books,
  Open Library, Wikimedia, Amazon and a few placeholder services), so an arbitrary server cannot learn who opens a
  book. Covers already stored are untouched; editing one with a link on another host is rejected.
- **Sessions follow the account:** the auth middleware reads status and roles from the database on every
  request, so suspending, deleting or demoting an account takes effect at once instead of when its token expires.
- Emails in `ADMIN_EMAILS` cannot be registered in production (emails are not verified), so nobody can claim
  an admin address that has no account yet. Existing accounts are still promoted on login.
- `JWT_SECRET` must have at least 32 characters in production (startup fails otherwise) and tokens are signed
  and verified with HS256 only.
- **Breaking:** passwords need 8 to 72 bytes on register and password change (bcrypt ignores anything past 72).
  Existing accounts with shorter passwords can still sign in.
- **Rate limiting (production only):** a general limit of 600 requests per 15 minutes on `/api`, counted per
  signed-in user (per IP otherwise), plus 10 login attempts per email and 5 password changes per user.
  Sign-ups per IP went from 3 to 10 per hour.
- Login takes as long for an unknown email as for a wrong password, so response time no longer reveals which
  emails have an account.
- Cover URLs (books and admin catalog edits) must be `http(s)` links of at most 500 characters; plain `http`
  is stored as `https`. `javascript:`, `data:` and similar are rejected.
- New `DATABASE_CA_CERT` setting verifies the database server certificate; production logs a warning while it
  is unset. New `API_DOCS_ENABLED=false` hides Swagger UI (on by default, as the README advertises it).
- The payment webhook signature now covers the exact bytes received instead of a re-serialised copy of the
  parsed JSON, and `PAYMENTS_WEBHOOK_SECRET` can replace the key derived from `JWT_SECRET`.
- **Changing the password ends the other sessions:** `PATCH /api/me/password` now answers with a fresh `token`
  and `user` (the caller must switch to it); tokens issued before the change get 401 `INVALID_TOKEN`
  (`users.token_version`).
- Dependencies updated with `npm audit fix` (including `proxy-addr`, `body-parser`, `brace-expansion`).

### Added

- **Terms acceptance:** `POST /api/auth/register` now requires `acceptTerms: true` and stores when and
  which version of the Terms of Service and Privacy Policy was accepted (`users.terms_accepted_at`,
  `users.terms_version`; NULL for accounts created before). **Breaking:** requests without it get 400.
- **Accounts with roles** (`reader`, `buyer`, `seller`, `admin`): register with an optional
  `roles` list, `GET /api/me`, `PATCH /api/me/roles`. The library (`/books`, `/stats`) now
  needs the `reader` role; existing accounts default to it. Admins come from `ADMIN_EMAILS`.
- **User administration** (`/api/admin/users`): search, edit name/email/roles and suspend or reactivate
  accounts, with guards (no self-suspension, the last active admin is protected) and an **audit log**
  (`/api/admin/audit-logs`) that also records company verification. Users can change their own name and
  password (`/api/me/profile`, `/api/me/password`). Suspended accounts cannot sign in.
- **Shared catalog** (`/api/catalog`, `/api/admin/catalog`): a book exists once (ISBN-13; books without
  ISBN are matched by metadata). Library entries reference it and keep only personal data. The first
  registration is approved at once and flagged for admin review; other edits become revisions an admin
  approves or rejects. **Breaking:** ISBNs are validated (check digit) and normalised to ISBN-13, the same
  ISBN by two readers now shares one catalog book instead of conflicting, and `PUT /api/books/:id` may
  answer with `pendingRevision` instead of applying descriptive changes. Existing books were migrated.
- **Second-hand bookstore** (`/api/marketplace`, `/api/admin/marketplace`): listings by people or verified
  companies, single-seller orders with stock reserved under row locks, flat shipping per listing or free
  pickup, tracking codes, and admin views of orders and listing takedown. Unpaid orders expire.
- **Simulated payments** (`/api/payments/webhook`): Pix and test-card charges behind a `PaymentGateway`
  port, confirmed through an HMAC-signed, idempotent webhook. Built so a real payment is impossible: the Pix
  code is deliberately not a valid BR Code, production answers `503` unless `ALLOW_SIMULATED_PAYMENTS=true`,
  payment SDK imports are banned by ESLint, and only test card numbers are accepted. See
  `docs/architecture.md`.
- **Companies**: `POST/GET/PUT /api/companies`, member management, and admin verification
  (`/api/admin/companies`). CNPJ is validated and unique.
- **Bounded contexts** (`identity`, `library`) with ESLint-enforced boundaries, structured
  JSON logs (pino), an `X-Request-Id` on every response, and `context`/`requestId` in error
  bodies. See `docs/architecture.md`.
- Unit test suite (`npm run test:unit`) with mocked persistence and coverage thresholds.
- TypeORM migrations (`src/migrations`) with `migration:*` scripts. Pending
  migrations run on startup, replacing the `DB_SYNC` flag (removed). The baseline
  is idempotent for existing databases.
- Indexes on `books` (`user_id`, `status`, `title`, `author`).
- `keep-warm` workflow that pings the hosted API, database and frontend on weekdays.
- `.github/rulesets/protect-main.json` to import as a branch ruleset.

### Fixed

- `PUT /api/books/:id` now clears optional fields (rating, notes, ...) when they are sent as
  `null`; previously the update was silently ignored.

### Security

- On startup the API enables Row Level Security on its tables and revokes the
  Supabase `anon`/`authenticated` roles, so the data is not readable through
  Supabase's public REST API. No-op on plain PostgreSQL.

### Changed

- **BREAKING (API responses):** error bodies now include a machine-readable
  `code` (e.g. `BOOK_NOT_FOUND`, `ISBN_ALREADY_REGISTERED`, `VALIDATION_ERROR`)
  and validation errors return every failing rule joined in `error` plus a
  `details` array.
- **BREAKING (language):** all API messages are now in English.
- Request validation moved to [Zod](https://zod.dev) schemas applied by a
  `validate` middleware; controllers no longer hand-roll field checks.
- Centralised error handling: services throw typed `AppError`s that a single
  Express error handler converts to HTTP responses (`asyncHandler` removes the
  per-controller `try/catch`).
- Environment variables are parsed and validated once at startup into a typed
  `env` object.
- `list` now rejects `sortBy` values outside an allow-list (previously the raw
  value was interpolated into the query).
- Unknown routes return a JSON `404` (`ROUTE_NOT_FOUND`) instead of Express' HTML.

### Added

- ESLint + Prettier configuration and `lint` / `format` / `typecheck` scripts.
- `zod` dependency.

### Removed

- Dead code: the unused `where`/`order` builders in `BooksService.list`, the
  previously-unregistered error handler, `getJWTSecret`/`validateEnv` helpers.

## [0.1.0] - 2026-08-31

First tagged version (pre-1.0; improvements ongoing): JWT auth, book CRUD with
filtering/pagination, reading status with automatic timestamps, per-user data
isolation, reading statistics, Swagger docs, Docker/Render deployment.

[Unreleased]: https://github.com/bookshelf-web/bookshelf-api/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/bookshelf-web/bookshelf-api/releases/tag/v0.1.0
