# Verification

Verified on 2026-10-16 for authentication, onboarding and preferences.

32 frontend unit tests passed, including form submission, schema validation and gateway security. Twenty desktop/mobile browser scenarios passed across the connected run and the targeted accessibility rerun after fixing a Windows setup race. Connected checks used disposable PostgreSQL/Redis and covered signup, signin, onboarding, preference persistence, password change, signout, protected redirects, theme persistence, accessibility and supplied logo variants.

Strict TypeScript, ESLint, Prettier and native production builds passed. Docker production image builds passed during the account implementation. The final checkout is running in Docker development mode: Next.js uses webpack development mode and Nest uses --watch. Compose Watch processes are active in both repositories; temporary file synchronization probes were verified and removed. PostgreSQL and both Redis services are healthy.

No SMTP service is configured. Email verification and forgotten-password delivery remain unavailable. No test accounts remain in the regular application database.

## Financial accounts and workspace updates

The latest frontend run passed 53 unit tests, strict TypeScript, ESLint, Prettier, and the production build. Accounts now support exact opening balances, supported currencies, creation, updates, archive confirmation, restoration, and pagination. Gateway tests cover filter/cursor forwarding; form tests cover pending controls, failure recovery, and saved appearance. The signed-in workspace is edge to edge, with stationary desktop navigation, Radix scrollbars, a mobile drawer, a bottom-left profile menu, and appearance selection in Settings.

The API's disposable PostgreSQL/Redis run passed 30 HTTP/database tests, including account ownership, exact decimal storage, currency precision, dates, pagination, archive/restore, and the CSRF budget regression. The API's 16 unit tests also passed. Browser review uses temporary unique users that are removed with their accounts after each run.

Desktop, tablet, and mobile browser review passed account creation/persistence, editing, archiving/restoration, navigation, settings appearance, accessibility, and signout from the profile menu. Poppins is restored for headings; Google Sans remains the body font. Font loading, desktop/mobile rendering, horizontal overflow, the final production build, and the rebuilt Docker development image were checked. Compose Watch synchronization and deletion of a temporary probe were verified after the dependency rebuild.

## Accounts completion — 2026-10-16

The final full frontend run passed 59 unit tests. Strict TypeScript, ESLint, Prettier, whitespace checks and the production build passed. The API passed 19 unit tests and 33 real PostgreSQL/Redis HTTP/database checks in disposable containers.

Targeted live Docker browser review verified create/edit dialogs, keyboard focus and pending locks, optional institution/notes, dedicated account details, persistence after reload, immutable currency, archive confirmation and restoration, and missing-account handling. Review covered 390px mobile/light and 1440px desktop/dark with no accessibility violations in the checked WCAG 2 A/AA and 2.1 AA rules. Temporary users were removed afterward. The persistent connected Accounts Playwright scenario was extended for detail navigation and locked currency; the full standalone Playwright suite was not rerun for this phase.

API currency precision now controls validation and formatting, including when browser ICU data differs. Today follows the saved profile timezone; opening calendar dates remain unchanged by timezone display, while audit dates use the saved timezone. New details views preserve the stationary frame and inner-pane scrolling on compact screens. Both Docker services are healthy, and synchronization and removal of temporary Compose Watch probes were verified.

## Categories — 2026-10-17

The full frontend suite passed 75 tests. New checks cover normalization and invalid inputs, grouped ordering, archived-child visibility, saving locks and failure recovery, parent-first restoration, fixed type/hierarchy choices, automatic income selection after creation, and gateway category action restrictions. API verification passed 19 unit and 45 real database/HTTP tests. Production builds and static checks passed in both repositories.

Targeted live Docker browser checks passed create/edit dialogs, customization, one-level subcategories, reordering and persistence, immutable type, parent/child archive and restoration, income creation, mobile navigation, fixed-frame scrolling, and 390px dark / 1440px light layouts. Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA checks passed for the inspected pages and dialogs. Filter color transitions were removed to prevent a transient contrast failure. Compact category rows stack their labels and actions so names keep usable width.

The persistent connected Categories Playwright scenario was added for the isolated browser runner. The full standalone Playwright suite was not rerun in this phase; live browser review used temporary unique users and removed them and their categories afterward. No default/demo categories or simulated transaction usage records were shipped.

## Payees — 2026-10-17

The full frontend suite passed 89 tests. New checks cover normalized names/notes, invalid inputs, encoded filters/cursors, save locks and preserved drafts, confirmed-save versus refresh-failure handling, search pagination/deduplication, merge survivor selection and acknowledgement, pending merge locks, read-only merged sources, archive confirmation/restoration and gateway allowlisting. The API passed 19 unit tests and 59 real database/HTTP tests.

Production builds, TypeScript, ESLint, Prettier and whitespace checks passed. Targeted live Docker review passed at 1440px/light and 390px/dark for creating all three payee types, rename/reload, explicit merge confirmation, retained source IDs/notes, merged-name search, status/type filters, archive/restore, modal and page layout, stationary compact headers and mobile navigation. Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA checks passed. Re-enabled controls switch colors immediately so transient disabled-color transitions do not reduce contrast.

The connected Payees Playwright scenario was added for the disposable browser runner. The full standalone Playwright suite was not rerun in this phase. Live review used unique temporary users and removed all their records afterward. Docker Desktop was recovered after an engine failure; both application services and dependencies are healthy, with refreshed Watch processes. Existing application data was preserved.

## Manual transactions — 2026-10-17

The full frontend suite passed 98 tests. New checks cover exact BigInt amounts and split validation, all-control submission locks and circular progress, writable edit payloads, retained create keys across uncertain retries, confirmed saves with failed list refresh, revision-checked deletion and paginated history. The same-origin gateway allowlists transaction reads/mutations and preserves history cursors and CSRF. The API passed 19 unit tests and 77 real PostgreSQL/Redis HTTP/database tests, including transactional balance rules, concurrency and ownership.

Production builds, TypeScript, ESLint, Prettier and whitespace checks passed in both repositories. Live Docker checks passed at 1440px/light and 390px/dark for category splits, forms and pending dismissal locks, expense-to-refund editing, deletion/history, income and account moves, exact resulting balances, opening-field locks, persistence, the stationary shell and mobile navigation. Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA checks passed. Maximum supported amounts and long payee names/notes also passed desktop/mobile overflow and accessibility checks. Temporary review records were removed afterward.

The live browser review caught an edit payload including read-only response fields; the form now constructs only writable fields and has a regression test. Next's development compiler restarted once at its memory threshold during initial browser setup; checks were repeated after compilation settled. The connected Transactions Playwright scenario was added; the full standalone Playwright suite was not rerun. Both Docker development services remain healthy with Watch enabled.

## Transfers — 2026-10-17

The full frontend suite passed 112 tests. Added checks cover exact effective-rate calculation and half-up rounding, entering actual amounts in either order, explicit rate calculation, invalid-rate handling without stale receipts, same-currency synchronization, destination-fee previews and cleared zero-fee references, all-control locks and progress, writable-only payloads, dates/account distinction, uncertain create retries, confirmed-save refresh failures, aggregate deletion, history pagination and gateway restrictions against individual-leg mutations. API verification passed 19 unit tests and 96 real PostgreSQL/Redis HTTP/database tests.

Production builds, TypeScript, ESLint, Prettier and whitespace checks passed in both repositories. Live Docker checks passed at 1440px/light and 390px/dark for linked transfers, source/destination/third-account fees, FX amounts/rates, editing and deletion of all movements together, exact balances and restoration, history, active/deleted account filters, archived-account restrictions, opening-field locks, responsive dialogs, fixed headers and mobile navigation. Maximum amounts, tiny rates and long text passed compact overflow checks. Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA checks passed. Temporary review records were removed afterward.

Development startup and Watch processes were restored after stale PID locks; the web service was briefly stopped for the production build on the memory-constrained local host, then restored in development mode. Interaction-test timeouts are explicitly bounded at 15 seconds rather than the default five seconds. Browser review was repeated after a stalled development session and uses retries only for idempotent verification reads. The connected Transfers Playwright scenario was added; the full standalone Playwright suite was not rerun for this phase. No live market-rate feed or demo transfers were shipped.
