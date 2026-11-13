# Security Policy

## Scope

Tsundoku is a **test project**, built for automation and manual-testing practice. It holds no real data and gives no availability guarantee. Please never create accounts with real personal data (see the Terms of Service in the app).

This repository is the API of the project. Reports about the frontend belong in its own repository.

## Supported versions

Pre-1.0: only the latest `master` receives fixes.

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

Report privately through GitHub's
["Report a vulnerability"](https://github.com/Tsundoku-books/bookshelf-api/security/advisories/new)
form. Include the steps to reproduce and the impact you observed.

Replies are best effort, usually within a few days. There is no bug bounty.

## Out of scope

- Denial of service and volume-based attacks.
- Rate-limit tuning.
- The registration endpoint revealing that an e-mail is already registered (known, tracked).
- Automated scanner output without a demonstrated impact.
