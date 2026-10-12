# Development conventions

Use npm exclusively, with the tracked package-lock.json. Node 24 LTS is the CI target; Node >=22.14 meets the current tooling minimum. Use exact direct dependency versions and review intentional updates with `npm outdated` and official migration notes. Do not use automatic forced audit downgrades that replace current Next.js tooling with unrelated older releases.

ESLint is pinned to 9.39.5, the newest release compatible with all Next.js 16.4 React/import/accessibility plugin peer ranges. ESLint 10 is newer but those peers currently reject it. Review this compatibility exception when the plugins update.

Use Conventional Commits, for example `feat: add account form` or `fix: validate redirect paths`. Husky runs lint-staged, which checks/formats only staged application sources. Full type checks/tests/builds belong in CI. Hooks are installed by npm's prepare lifecycle; do not commit generated Husky internals.

Prefer feature ownership and small files over generic service classes. Avoid barrels, circular imports, untyped response assertions, and duplicate form/state libraries. Application code must avoid any. Upstream AlignUI's polymorphic helper retains its original generic defaults; lint exceptions are narrowly scoped to vendor files and its observer hook. React Compiler is not enabled; TanStack Virtual's intentionally imperative API is exempt from the compiler-specific lint warning.

## Forms

Use TanStack Form for state and Zod Standard Schema for validation. `TextField` and `FormField` compose the actual AlignUI Label/Input/Hint components. Field errors are associated with the control and announced. Use a form-level Alert for submission failures, a safe mapped field error for known API validation fields, and a success status after a confirmed mutation. Disable controls while submitting. Never display arbitrary backend error text.

Patterns for future controls:

| Value               | Composition / validation                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| Text/email/password | TextField + string/email schemas; appropriate autocomplete                                               |
| Number              | TextField type=number; keep editing value as a string, parse and validate explicitly                     |
| Currency            | TextField inputMode=decimal; parseMoney(value, currency), never parseFloat for calculations              |
| Calendar date       | TextField type=date or AlignUI Calendar inside Popover; z.iso.date()                                     |
| Select              | FormField + AlignUI Select.Root/Trigger/Content/Item; connect value/onValueChange                        |
| Checkbox            | FormField + AlignUI Checkbox.Root; checked/onCheckedChange, exclude indeterminate from boolean contracts |
| Radio               | FormField + AlignUI Radio.Group/Item; associate labels and group help                                    |
| Multiline           | FormField + AlignUI Textarea.Root; controlled value, max length, aria-describedby                        |

Keep accessible input IDs stable and unique. Use field.handleBlur and field.handleChange; use the form's subscribe API for submission state. Consult the installed component's exports rather than assuming a component API. Auth example forms validate only and never send or store credentials.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, and `npm run build`. E2E tests use a production build: `npx playwright install chromium` then `npm run test:e2e`. Playwright explicitly enables sample mode for its server. MSW is configured for tests with unhandled frames rejected, and handlers can be added once a real API contract exists. API unit tests use isolated fetch fixtures rather than asserting invented backend endpoints.

Use tests for meaningful invariants: monetary precision, response validation, unsafe redirects, accessible recovery, form errors, and table filtering. Browser tests also run axe checks against every implemented route, invalid form feedback, dark appearance, and mobile navigation, including keyboard dismissal and focus return. Automated accessibility checks complement manual assistive-technology review. Inspect changed UI at desktop/mobile widths. Test cross-origin cookie and CSRF behavior with the real backend before launch.

## First-party source layout and license

Every first-party TypeScript/config source begins with a file-specific overview of its behavior, a short explanation of its purpose, contributor attribution, and a proprietary license reference. Headers document the module; coding instructions belong in this conventions document. Sections use comment dividers with a blank line before/after actual code. Empty sections and their dividers are omitted. npm run style:check enforces these details. Small standalone modules use one top-level arrow function and default export. Next.js HTTP/proxy/metadata exports, React/TanStack callbacks, test registrations, data-only schema/type modules, and Error subclassing are required exceptions. The ApiError class exists only to preserve a typed Error/instanceof contract. Vendor AlignUI components, utilities and observer retain their original named exports and MIT attribution.

ESLint flat configuration executes globalIgnores; .eslintignore is retained only for explicitly requested legacy-tool compatibility and ESLint reports a deprecation warning about its presence. TypeScript scripts use tsx; the copied container health script runs directly under Node 24 type stripping. Community materials retain their separate attribution, and project first-party licensing is governed by LICENSE rather than MIT.
