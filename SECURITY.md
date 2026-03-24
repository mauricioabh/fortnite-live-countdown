# Security Policy

## Supported versions

Security updates are applied to the latest release on the default branch unless otherwise stated.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report them privately to the maintainers:

1. Open a **GitHub Security Advisory** (if enabled for this repository), or
2. Email the repository owners with:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to acknowledge reports within a few business days.

## Scope

- Secrets (Clerk, `DATABASE_URL`, `CRON_SECRET`, `FORTNITE_API_KEY`) must never be committed. Use `.env.local` and Vercel/EAS secrets.
- The cron ingestion endpoint must verify `CRON_SECRET` before performing work.

## Disclosure

Please allow reasonable time for a fix before public disclosure.
