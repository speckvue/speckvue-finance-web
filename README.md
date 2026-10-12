# Speckvue Finance Web

[![CI](https://github.com/speckvue/speckvue-finance-web/actions/workflows/ci.yml/badge.svg)](https://github.com/speckvue/speckvue-finance-web/actions/workflows/ci.yml)
[![CodeQL](https://github.com/speckvue/speckvue-finance-web/actions/workflows/codeql.yml/badge.svg)](https://github.com/speckvue/speckvue-finance-web/actions/workflows/codeql.yml)
![License: proprietary](https://img.shields.io/badge/license-Speckvue_proprietary-lightgrey)

A public-facing personal finance product with proprietary source code maintained in a private Speckvue repository. See LICENSE. AlignUI and other third-party materials retain their separate licenses and attributions in THIRD_PARTY_NOTICES.md.

The application provides a working sample dashboard and frontend architecture. Production authentication, real financial features and NestJS services are not implemented. Legal pages remain explicitly unapproved placeholders.

## Installation and native usage

Use Node 24 LTS (24.10 or newer recommended), npm and Git. npm is the exclusive package manager; exact dependencies are locked in package-lock.json.

```powershell
cd C:\Users\cheta\Desktop\projects\speckvue\finance\speckvue-finance-web
npm ci
Copy-Item .env.example .env  # New checkout only; preserve existing configuration.
npm run dev
```

An ignored central .env has already been created in this working directory, preserving the earlier .env.local values. The .env.local file was migrated rather than left as a competing override. Open the configured NEXT_PUBLIC_APP_URL. The root redirects to the dashboard; development labels all data as samples.

## Central configuration

Edit .env for both native and Docker operation. APP_PORT, APP_HOST and API_PORT configure binding and expanded URLs; APP_PROTECTION_PORT is the separate E2E session-guard server. NEXT_PUBLIC_APP_URL and NEXT_PUBLIC_API_URL expand references to those ports. The same file owns Docker image/base image, non-root UID/GID, interfaces, health timings, polling, restart and cache limits. scripts/load-env.ts validates and expands it before Next.js or Docker launches.

Never commit .env or secret values. .env.example remains tracked. Public Next.js variables are compiled into the client bundle: rebuild after changing them. ENABLE_DEMO_MODE=false protects production pages; explicitly set it true only for an intentional sample preview. CI copies safe example configuration and injects release credentials through GitHub Secrets.

## Docker

Use Docker Desktop's Linux engine or a Speckvue-managed Linux Docker engine.

```powershell
npm run docker:up       # Hot reload, bind-mounted source, dependency/cache volumes.
npm run docker:build    # docker build with validated arguments from .env.
npm run docker:run      # docker run with the .env image, port and health settings.
npm run docker:prod     # Hardened production Compose configuration.
npm run docker:config   # Validate development Compose without an engine.
```

Native Compose is also supported:

```powershell
docker compose --env-file .env up --build
docker compose --env-file .env -f docker-compose.prod.yml up --build -d
```

The multi-stage image uses Next.js standalone output, a non-root user, and /api/health. Production Compose drops capabilities, prevents privilege escalation, uses a read-only filesystem and limits temporary/cache writes. All configurable values come from .env; no public image/package/artifact is published. See docs/docker.md for dependency-volume updates and complete runtime configuration.

Docker Desktop currently cannot start its engine on this host. Both Compose files validate, and standalone production/browser checks pass; an actual container build/run is not claimed until the engine is available.

## Stack and themes

Next.js 16 / React 19 / TypeScript 6 with strict and noUncheckedIndexedAccess, Tailwind CSS 4 and AlignUI public base components. TanStack Query owns server state; Table 9 and Virtual provide data grids; TanStack Form and Zod provide forms/contracts. Zustand holds ephemeral shell state only.

next-themes is the sole theme manager: light, dark, system preference, manual switching and persistent preference. The root provider configures class-based themes and CSP nonces; the header demonstrates useTheme/setTheme. There is no second theme store or manual localStorage implementation. A small pure next-theme helper cycles preferences without owning persistence.

All 49 public AlignUI UI entries are installed across 52 UI source files, plus its documented utilities/observer. PRO components require separate access. Use direct imports and preserve upstream composition. See docs/alignui.md and docs/alignui-inventory.json.

## Commands

| Command                                       | Purpose                                                              |
| --------------------------------------------- | -------------------------------------------------------------------- |
| npm run dev / build / start                   | Native .env-driven development, standalone build, production serving |
| npm run typecheck                             | Strict TypeScript including indexed access checks                    |
| npm run lint / lint:fix                       | ESLint flat config                                                   |
| npm run format / format:check                 | Prettier with package.json and Tailwind plugins                      |
| npm run style:check                           | Guide headers, arrow functions, spacing and nonempty sections        |
| npm test / test:watch                         | Vitest and component tests                                           |
| npm run test:e2e                              | Desktop/mobile verification using the standalone runtime             |
| npm run commit                                | Conventional Commit prompt; commits only staged changes              |
| npm run release / release:dry-run             | Authorized repository release / permission-aware dry run             |
| npm run docker:build / docker:run             | .env-driven Docker CLI helpers                                       |
| npm run docker:up / docker:prod / docker:down | Compose operations                                                   |
| npm run docker:config / docker:smoke          | Configuration / actual container readiness verification              |
| npm run audit:dependencies                    | Production dependency audit                                          |
| npm run alignui:tokens                        | Official interactive token generator; overwrites CSS                 |

## Architecture and structure

The exact route groups are src/app/(auth), (main) and (legal). Server Components are the default. Shared/UI/layout components are separate from feature ownership. lib holds API/session/query/configuration infrastructure; scripts holds TypeScript startup, Docker, style and release tooling. Monetary arithmetic uses integer minor units; data contracts are validated with Zod. Secure session checks run at page/data boundaries as well as layouts.

```text
.github/workflows/{ci,release,codeql,docker}.yml
.husky/{pre-commit,commit-msg}
.vscode/{settings,extensions}.json
src/app/{(auth),(main),(legal),api/health}
src/components/{ui,shared,layouts}
src/features/{auth,dashboard}
src/{lib,hooks,stores,styles,types,test,utils}
scripts/                       # TypeScript tooling and startup
docs/                          # Architecture, Docker, releases and verification
templates/document.md          # Reusable front-matter/document template
Dockerfile / docker-compose*.yml
.env.example / package.json / package-lock.json
LICENSE / THIRD_PARTY_NOTICES.md / community files
```

The full source tree is recorded in docs/project-tree.md. Complete source content is available in this checkout. Read docs/architecture.md for integration/security decisions and docs/conventions.md for code layout rules and exceptions.

## Contributions and repository releases

Follow CONTRIBUTING.md and CODE_OF_CONDUCT.md. First-party code is for authorized Speckvue contributors. Husky/lint-staged format and lint staged changes; commitlint validates every commit message. Semantic-release updates versions/changelog and creates GitHub releases in the private repository from verified main commits. npmPublish=false and private=true remain enforced.

CI, Docker validation, CodeQL and release workflows use standard GitHub-hosted Ubuntu runners. Repository privacy controls access to source and release metadata. No npm package or Docker image is published by these workflows. Configure release permissions/branch rules as described in docs/releases.md. No release, commit, push or deployment was executed during scaffold creation.

## Verification and remaining work

See docs/verification.md for actual results and limitations. Backend session/API contracts, CSRF/CORS, permissions, approved policies, deployment review and release permissions still need configuration. SECURITY.md describes private reporting.

Production audit reports zero findings. The full audit currently reports 20 development-tool findings (18 high, 2 moderate), including unpatched braces and vulnerable dependencies bundled with the release plugin's npm version. Compatible audit fixes were attempted; major downgrades and silent vulnerability suppression were not applied. Review upstream updates before enabling release automation.
