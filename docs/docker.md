# Docker operation

`.env` is the central configuration file for native startup, build scripts, tests, Docker build arguments, Docker runtime settings, and Compose. `.env.example` contains safe defaults; copy it to `.env` and edit that one file. `.env` is Git-ignored and excluded from the Docker build context. The former `.env.local` values were migrated into `.env`; do not keep competing `.env.local` overrides.

`scripts/load-env.ts` parses and expands references such as NEXT_PUBLIC_APP_URL="http://localhost:${APP_PORT}", validates ports/settings with Zod, and respects explicitly supplied process environment values. CI uses a disposable copy of .env.example and GitHub Secrets for release credentials. Native dev/build/start commands load configuration before Next.js starts, so changing APP_PORT affects actual binding and URLs.

## Development

```powershell
Copy-Item .env.example .env  # Only for a new checkout; preserve an existing .env.
npm run docker:up
```

The command invokes `docker compose --env-file .env up --build`. Source is bind-mounted, dependencies and Next cache use separate volumes, and the development target uses Webpack with configurable polling for Docker Desktop hot reload. Compose overrides APP_HOST with the DOCKER_HOSTNAME value from .env so the container accepts mapped connections; native startup uses APP_HOST from the same file.

After changing package-lock.json, update the dependency volume with `docker compose --env-file .env run --rm web npm ci` and recreate the service. `npm run docker:down` stops development services without deleting named volumes.

## Production

```powershell
npm run docker:build
npm run docker:run
# Or use the hardened Compose service:
npm run docker:prod
```

The npm helpers execute Docker's `docker build` and `docker run` with validated build arguments, image tag, host/container ports, demo mode and health timings read from .env. Bare docker build does not read .env automatically; use the helpers or supply the same arguments explicitly. Native Docker Compose reads these variables directly:

```powershell
docker compose --env-file .env -f docker-compose.prod.yml up --build -d
docker compose --env-file .env -f docker-compose.prod.yml down
```

The multi-stage Dockerfile installs with npm ci, builds Next.js standalone output, and copies only runtime output/assets, the health script, and first-/third-party license notices into the final image. The configured numeric UID/GID must be positive; production does not run as root. Production Compose uses a read-only root filesystem, dropped capabilities, no-new-privileges, init, and bounded temporary/cache mounts. No image is pushed to a public registry.

## Configuration ownership

| .env fields                                           | Used for                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| APP_PORT / APP_HOST / APP_PROTECTION_PORT             | Native binding, Compose mapping, readiness and test server ports |
| API_PORT / NEXT_PUBLIC_*                              | Expanded frontend/API URLs and public build-time metadata        |
| DEV_NODE_ENV / PROD_NODE_ENV                          | Mode selection without maintaining competing environment files   |
| NODE_IMAGE / DOCKER_IMAGE / DOCKER_UID / DOCKER_GID   | Base/runtime image identity and non-root user                    |
| DOCKER_HOSTNAME / DOCKER_BIND_HOST                    | Container binding and published host interface                   |
| HEALTHCHECK_* / DOCKER__HEALTH_                       | Probe address, timeout, intervals, grace periods and retries     |
| DOCKER_POLLING / DOCKER_RESTART_POLICY / DOCKER_*SIZE | Development watcher and production runtime resources             |

Public variables are compiled into the client bundle: rebuild after changing NEXT_PUBLIC_* values. ENABLE_DEMO_MODE is a runtime switch; false remains the default in production. The readiness endpoint /api/health reports only process readiness, with no backend dependency or personal data. The API origin is browser-facing, so localhost addresses refer to the browser's machine; do not silently replace them with Docker service names. Real server-to-backend integration needs a separately validated private origin when that contract is implemented.

## Verification and CI

`npm run docker:config` and `docker compose --env-file .env -f docker-compose.prod.yml config --quiet` validate both configurations without needing an engine. `npm run docker:smoke` checks the configured non-root user and live readiness endpoint, then removes only the test container it created.

GitHub-hosted Ubuntu runners verify native builds, Docker image readiness, and releases in the private repository. Repository permissions protect source access. No registry push or artifact publication is configured.

The local Linux engine is now available. The production image built and passed non-root and readiness smoke checks. Hardened production Compose reached a healthy state with its read-only filesystem and capability restrictions. Development Compose reached a healthy state; dashboard rendering and mounted source updates are checked separately. Verification containers are stopped after checks, while reusable images and dependency/cache volumes are retained.
