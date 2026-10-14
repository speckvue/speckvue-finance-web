# Verification

The template cleanup removes sample features and updates checks for the remaining infrastructure. Run npm run check, npm run test:ci and npm run build. Run npm run infra:up before npm run test:e2e; free APP_PORT for the compiled test server. Browser checks cover theme persistence, accessibility, readiness, security headers and removed routes.

Docker production and Watch configurations remain supported. Earlier sample-feature test counts are historical and do not describe this template.

Verified on 2026-10-15: 25 unit tests and 14 desktop/mobile browser tests passed. Strict TypeScript, ESLint, Prettier, native Next build and Docker production image build passed. Browser checks confirm theme persistence, accessibility, security headers, Redis readiness and 404 responses for removed routes.
