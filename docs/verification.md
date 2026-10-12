# Verification record

Verified locally on 2026-10-13 (Asia/Calcutta) with Node 24.19.0 and npm 12.2.0 on Windows. npm was invoked through `node .tools/package/bin/npm-cli.js` because npm was absent from the Codex execution PATH; the standard equivalent commands are listed below. The bootstrap tooling is ignored and is not an application dependency.

| Check                           | Final result                                                                |
| ------------------------------- | --------------------------------------------------------------------------- |
| npm ci                          | Pass: clean installation from the pinned lockfile; Husky prepare executed   |
| npm run typecheck               | Pass                                                                        |
| npm run lint                    | Pass: no lint errors; legacy .eslintignore emits a deprecation warning      |
| npm run style:check             | Pass: file-specific purpose headers, section spacing, and nonempty sections |
| npm run format:check            | Pass                                                                        |
| npm test                        | Pass: 20 tests across 8 files                                               |
| npm run build                   | Pass: Next.js 16.4.0 production build                                       |
| npx playwright install chromium | Pass: Chromium/headless shell installed for local testing                   |
| npm run test:e2e                | Pass: 10 browser and accessibility tests across desktop and mobile Chromium |
| npm audit --omit=dev            | Pass: zero production dependency findings                                   |
| npm audit                       | Outstanding: 20 development-tool findings (18 high, 2 moderate)             |
| npm run docker:config           | Pass: development and production Compose configurations                     |
| npm run docker:build            | Pass: production Linux image built successfully                             |
| npm run docker:smoke            | Pass: configured non-root user and readiness response                       |
| Production Compose              | Pass: hardened service reached healthy state                                |
| Development Compose             | Pass: healthy service and dashboard rendering                               |
| Compose Watch                   | Pass: creation/deletion sync, hot reload, config restart, image rebuild     |
| npm ls --all --json             | Pass: no dependency/peer problems after npm prune                           |
| git diff --check                | Pass; initial repository had no tracked application files                   |

The final build includes the root redirect, dashboard, four auth pages, three legal pages, not-found handling, icon, robots and request-nonce proxy. Application pages render dynamically because CSP uses request-specific nonces.

Browser tests run against the native Next.js standalone server and cover the dashboard, filtering/empty-state recovery, mobile drawer, persistent dark theme across reload, auth validation, clearly marked legal placeholders, production sign-in redirection with demo mode disabled, absence of dashboard content in unauthorized response payloads, CSP/nosniff headers, the readiness endpoint, and the native Node health probe. Axe checks scan all implemented routes, invalid form feedback, dark appearance, and the mobile drawer; keyboard dismissal restores focus. Detected navigation, validation feedback, and dark brand contrast issues were corrected using the existing palette. Desktop/mobile light and dark screenshots were visually inspected. Browser tests use Chromium; Safari/Firefox and a full manual WCAG audit are not claimed. Actual production and development containers have now run successfully, and verification containers were removed afterward without deleting source or reusable volumes.

During verification, a layout-only protection pattern exposed child page content in the RSC stream even though the layout redirected. The final code invokes request-cached requireSessionState at both the layout and page boundaries. The test now verifies that content is absent and the browser reaches sign-in; Next.js can send streamed redirects after HTTP 200.

AlignUI public installation blocks required Tailwind 4 grid-template corrections, DayPicker 10 slot/DOM adaptations, and class-based dark utility configuration. Original design tokens, component variants and source attribution are preserved. All public component inventory paths resolve to local files; PRO content was not accessed.

## Future product integration outside the frontend scaffold

- Define NestJS API/session/error/pagination contracts, then implement verified secure-cookie authentication, CSRF/CORS, role/permission enforcement and logout/cache clearing.
- Provide reviewed legal policy content and decide indexing/deployment origin policy.
- Address the unpatched development-tool dependency chain when compatible upstream releases become available. See docs/alignui.md for the advisory.
- Verify deployment HTTPS/security headers, accessibility with assistive technologies, and the actual backend integration before treating this as a launched financial product.

Commitlint accepted a valid Conventional Commit fixture and rejected an invalid message. Release analysis returned a minor version for a feature commit; configured plugins resolved, npm publication was disabled, and private-repository release settings passed inspection. The npm release plugin updated a disposable private package from 0.1.0 to 0.2.0 and skipped publication. No product version was changed by this fixture.

The full development audit still reports 20 findings. The latest npm 12 override was trialed and removed because its bundled vulnerable versions remained unchanged. Latest official braces remains 3.0.3 with the advisory outstanding. No forced framework downgrade, unofficial replacement package, or advisory suppression was applied. Production audit remains clean.

Compose Watch was verified with polling disabled. Source creation and deletion synchronized into the container; changing a dashboard heading hot-reloaded the rendered page. A temporary TypeScript configuration edit restarted the service, and a temporary Dockerfile comment triggered an image rebuild and container replacement. All temporary edits were restored and verification services were stopped. The requested product description was confirmed in rendered metadata.

The application is now running in Docker for review with Watch enabled. Google Sans and Poppins replace the former font dependency: browser checks confirmed local font downloads, Google Sans on body text and controls, and Poppins on headlines in dashboard, authentication, legal, and missing-page routes. The font license texts are preserved and the production build passed. The expanded 14-case browser suite passed across the Docker development frontend and a separate production session-protection server; three cases initially hit development compilation timeouts and passed when rerun with development-only time limits. Standard production test limits remain unchanged.

Theme regression cases verify explicit Light, Dark, and System choices, persistence on reload, actual background color changes, and system preference updates on desktop and mobile. The duplicate operating-system dark CSS block was removed while preserving the 88 matching class-based dark tokens. The appearance menu also passed its accessibility scan. Development origin configuration uses the hostnames already defined in .env. The development indicator is hidden; framework diagnostic fonts are separate from the two application font families.

The initial scaffold was committed as 9821f65 with baseline tag v0.1.0. The repository owner authorized committing all remaining changes and pushing main and the baseline tag to the private GitHub repository. Remote CI, Docker validation, and release results must be checked in GitHub Actions separately from the local checks recorded here. Backend services and full financial features remain outside this frontend scaffold's scope.
