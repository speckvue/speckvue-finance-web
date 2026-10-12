# Architecture

Speckvue Finance is a Next.js App Router frontend foundation for a separate NestJS service. No backend endpoints, production authentication, account integrations, or financial business workflows are implemented.

## Boundaries

- `app/(auth)` contains public validation-only authentication forms.
- `app/(main)` checks session state on the server before rendering the application shell. Development automatically shows labeled sample data. In production `ENABLE_DEMO_MODE=false` (the default) fails closed and redirects to sign-in; setting it to `true` explicitly exposes only the sample workspace.
- `app/(legal)` contains unapproved, clearly labeled policy placeholders.
- `features` owns feature-specific UI, mock contracts, and query hooks.
- `components/ui` contains source-based AlignUI primitives with direct imports. There is no runtime barrel importing the whole inventory.
- `components/shared` composes those primitives; `components/layouts` owns the shell.
- `lib` owns configuration, fetch, queries, auth integration points, validations, and exact monetary utilities.
- `stores/shell-store.ts` owns ephemeral shared navigation state. No financial data or credentials are persisted.

Server Components are the default. Forms, tables, providers, and interactive shell controls use client boundaries. Root providers contain one per-browser QueryClient and next-themes. The appearance menu offers explicit Light, Dark, and System choices; only the next-themes-managed HTML class selects dark tokens. Development origins derive from the application URL and binding hosts in .env. The dashboard summaries are server-rendered; the sample transactions demonstrate a query with cancellation and runtime validation.

## API and server state

`apiRequest(path, options)` accepts only paths within the configured API origin. Native fetch uses HttpOnly-cookie-compatible credentials, no-store, caller cancellation, a combined timeout signal, and a required Zod response schema. It normalizes failures to safe codes/messages. Empty responses require a schema accepting undefined. Raw server error text is never displayed. The `fieldErrors` contract is an integration extension: once NestJS specifies its validation envelope, map its validated field paths to known form fields. Do not invent that envelope now.

`PageResult`/`ListParams` are frontend conventions, not claims about the NestJS contract. Map the backend's real pagination, filtering, and sorting shape in a feature adapter. Query keys live centrally; demo keys are namespaced separately from future real data. Query retries are limited to transient failures, not authorization or validation failures; mutations never retry automatically. The demo reset hook shows mutation success invalidation without creating a fake backend endpoint.

TanStack Table v9 uses explicit feature registration and the native `useTable` API. The reusable table supports controlled server operations, optional virtualization, stable row IDs, selection, visibility, filtering, sorting, pagination, loading, and empty states. For server operations, pass `server` and a page of data; call your query in the owning feature. Virtualization is off for the small sample; only activate it when measured row counts justify it. Selection is view-local and no destructive bulk actions exist.

## Session integration checklist

Replace `getSessionState()` with a verified server-side session lookup once NestJS defines its cookie and endpoint contracts. Prefer Secure, HttpOnly, SameSite cookies with an appropriate path/domain; do not store tokens in localStorage. Verify expiry and revocation, do not trust cookie presence, and validate roles/permissions on the server and backend for every protected operation. Layout redirects improve navigation; they do not replace authorization on backend requests or future Server Actions.

Define sign-in, sign-up, reset, logout, session renewal, and failure contracts before wiring the forms. Validate redirect destinations with `safeRedirect`. On logout, revoke the backend session and clear QueryClient caches and private state. Refresh queries after session changes. `Session` carries role/permission extension points and `AccessState` supplies loading/unauthorized/forbidden feedback. No production identity is synthesized from mock data.

Call `requireSessionState()` before rendering each protected page and before future private data access, in addition to the shared layout guard. React Server Component children can render concurrently with layouts; a layout redirect alone must not be relied on to prevent data appearing in the RSC payload. Request-local React cache deduplicates the session lookup without persisting sessions between users. The production E2E check verifies the response omits dashboard content and the browser reaches sign-in. Layout redirects may stream with HTTP 200; see [Next.js redirect semantics](https://nextjs.org/docs/app/api-reference/functions/redirect).

For direct cross-origin cookie requests, NestJS must allow only the actual frontend origins with credentials, and choose cookie SameSite semantics suitable for the deployment topology. Coordinate CSRF tokens and origin checks for unsafe requests. The fetch wrapper accepts an explicit CSRF token; obtaining/validating it is a backend responsibility. Never disable CSRF or CORS safeguards to make the demo work.

## Security and rendering

Public environment variables are explicitly enumerated and validated with Zod; missing values fail clearly. Server configuration is in a `server-only` module. Public API origin exposure is intentional for future direct browser requests. No secret is required by this foundation.

`proxy.ts` generates a request-specific CSP nonce, forwards it to Next.js and next-themes, and sets the response policy. Production scripts require nonces; unsafe-eval is development-only for framework tooling. Inline styles are allowed because AlignUI/Radix positioning and progress need them. HTTP headers include frame denial, nosniff, referrer/permissions restrictions, and production HSTS. Deployment must use HTTPS and verify proxy/header behavior. Request nonces make application routes dynamically rendered; that is an intentional tradeoff for a financial workspace. Static assets remain cacheable.

React escapes rendered strings. Do not introduce raw HTML rendering for backend content. Private routes and the current preview are noindex; robots disallows all indexing until launch policy is decided. Do not log credentials, session responses, or financial data. Global and route errors show safe recovery actions.

## Money and dates

Monetary calculations use `bigint` integer minor units. Precision is determined from the currency through Intl, including zero- and three-decimal currencies. Parsing rejects excess decimal precision; addition rejects mixed currencies. Converting to Number is for bounded display only, never arithmetic. Serialize minor units as strings at a JSON API boundary; BigInt cannot be sent directly through JSON or Server Component props. The mock transaction contract uses safe integer minor units and converts only for presentation.

Date-only sample values are rendered at UTC midnight, with UTC as the default timezone. Real instants need ISO offsets and the user's chosen timezone; preserve calendar dates as calendar dates instead of converting them to a user's previous-day local instant. Locale and currency are configurable utility parameters; USD is only the example dataset's currency.

## Accessibility and performance

Use AlignUI/Radix semantics, labels, focus management, and keyboard behavior. Shared fields associate errors with inputs; status feedback is announced. The shell includes a skip link, keyboard focus is visible, reduced motion is respected, and tables scroll on narrow screens. Desktop and mobile smoke tests verify routes and interactions; these tests do not certify WCAG compliance. Complete a manual screen-reader/contrast audit before launch.

Google Sans is the global font for body text, controls, navigation, tables, and other interface text. Poppins is the font for h1 through h6 headlines; use font-heading for a headline composition without a heading element. These are the only installed font families, self-hosted through src/styles/fonts.css from Fontsource without build-time Google Fonts networking. Code and monospace/serif utility aliases resolve to Google Sans rather than introducing other fonts. Use next/image when real imagery is added. Avoid unnecessary providers, broad client imports, redundant global state, and premature caching of sensitive API data.

## Operational configuration

.env is the single native/Docker configuration source, parsed and expanded by scripts/load-env.ts. It replaces the earlier .env.local workflow. Development containers use Compose Watch for source synchronization, configuration restarts, and dependency rebuilds; .env is mounted read-only and host dependencies are excluded. Next.js standalone output drives the production container and E2E runtime. next-themes remains the only theme manager. First-party source licensing is proprietary; third-party notices remain separate. See docs/docker.md and docs/releases.md for operations.
