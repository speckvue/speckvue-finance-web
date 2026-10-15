# Speckvue Finance Web

Web application for Speckvue Finance, providing an intuitive interface to manage personal finances, track expenses, monitor income, and organize budgets.

A Next.js personal finance application with real email/password authentication, onboarding, saved preferences, session security, and manual financial accounts. No demo financial data or sample finance endpoints are shipped. See [financial accounts](docs/financial-accounts.md) and [account access](docs/accounts-and-preferences.md) for implemented flows and current delivery limitations.

## Start

Use Node.js 24 and npm 11 or 12. Run npm ci, npm run env:setup, npm run infra:up, then npm run dev. The ignored .env is the central configuration for native and Docker execution. Never put secrets in NEXT_PUBLIC_* fields.

For compiled Docker execution run npm run docker:prod. For development with source synchronization run npm run docker:watch. Docker Compose must support Watch initial_sync (CI uses 5.5.1). Restart after changing .env. Stop with npm run docker:down; named data and log volumes remain.

## Foundation

Strict TypeScript, Next.js App Router, AlignUI components, Tailwind, next-themes, Google Sans for body text and Poppins for headings, TanStack Query/Table/Form, Zod, an API client, safe redirects, exact money helpers, accessible error states, CSP and security headers remain available for real features. Protected pages verify real backend sessions on the server. The same-origin API gateway forwards HttpOnly cookies and CSRF-protected writes.

Winston provides JSON console output and rotating files. Redis is server-only; GET /api/health reports Redis readiness. The reusable public-data cache helper validates cached values and falls back to its origin during cache failure. No private or financial data is cached.

## Checks

Run npm run check, npm run test:ci, npm run build, and npm run test:e2e. Browser tests cover the starter page, accessibility, persistent themes, security headers, readiness, and removal of old routes. Start Redis before browser tests and free APP_PORT because tests launch their own compiled server.

## Structure

src/app contains public authentication routes, protected onboarding/workspace/settings pages, the API gateway, error boundaries and health endpoint. src/components contains reusable UI and shared components. src/lib contains API, query, configuration, validation, logging, Redis and utility infrastructure. Add feature folders when implementing actual product behavior. See docs/conventions.md, docs/architecture.md, docs/docker.md and docs/infrastructure.md.

First-party source is proprietary and intended for the private Speckvue repository. Dependency and AlignUI attribution remains in LICENSE, THIRD_PARTY_NOTICES.md and THIRD_PARTY_LICENSES.txt.
