# Agent Instructions

## Source of truth

`docs/sa-lite.md` is the only requirement source. Other documents reference FR/CASE/BR/UAT IDs and must not redefine them. Change requirements there first and verify IDs are unique and valid.

## Boundaries

- Do not add checkout, payment, orders, customer accounts, multilingual support, or a contact form to phase 1.
- Never expose non-public prices through HTML, SSR payloads, APIs, analytics, structured data, logs, or client state.
- Public UI uses Tailwind; Element Plus is restricted to admin features.
- Nuxt page components orchestrate features; business rules belong in feature/domain services.
- Nest controllers handle HTTP only; services own business rules and repositories own persistence.
- Do not mix package managers or delete `package-lock.json`.

## Safety

- Never commit secrets, `.env`, credentials, production data, uploads, or backups.
- Explain every dependency before adding it.
- Run typecheck, tests, and build before reporting completion.
- Use Conventional Commits but never commit or push without approval.
