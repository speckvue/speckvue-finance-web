# Contributing

Install Node 24 LTS and npm, run npm ci, copy .env.example to .env.local, and use npm run dev or npm run docker:up. Use the versioned VS Code settings if helpful.

Keep changes focused, use strict TypeScript, and preserve vendor attribution. Both repositories use Prettier and framework ESLint rules. Write comments for intent and non-obvious behavior; avoid repetitive headers and divider blocks. See docs/conventions.md.

Use next-themes for all theme state and persistence. Do not introduce another theme store. Use integer minor units for monetary calculations and validated contracts at API boundaries.

Stage your intended changes, then run npm run commit for a Conventional Commit prompt or git commit with a conventional message. The helper does not stage files. Husky formats/lints staged files and commitlint rejects invalid messages. Examples: feat: add account summaries; fix: reject unsafe redirects; docs: explain container configuration. Mark breaking changes with ! or a BREAKING CHANGE footer.

Before opening a pull request run npm run typecheck, npm run lint, npm run format:check, npm test, npm run build and npm run test:e2e. For container changes, validate both Compose files and run the production image's readiness check with Docker Desktop using Linux containers.

CI runs on pull requests and main/master pushes. Releases run only from main after the matching CI revision succeeds. Do not execute a real release from an unreviewed checkout. Follow the Code of Conduct and report security vulnerabilities privately as described in SECURITY.md.
