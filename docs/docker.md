# Docker

Run npm run env:setup before starting. .env configures ports, images, identities, health timings, credentials, resource limits and modes for native and Docker execution.

Use npm run docker:prod for compiled production containers and npm run docker:watch for development. Watch synchronizes source and rebuilds dependencies/configuration using Docker Compose initial_sync; CI pins Compose 5.5.1. Restart after editing .env. npm run docker:down stops the stack while preserving named volumes.

Both configurations include authenticated Redis and a non-root web service. Production uses a read-only root filesystem, dropped capabilities, no-new-privileges and writable bounded cache/temp mounts. Logs use a named volume. The image excludes local .env, dependencies, Git history and generated host output.

NEXT_PUBLIC_* values are compiled into the browser bundle; rebuild after changing them. GET /api/health checks Redis readiness. Application and Redis ports are centrally configured in .env. Development compiler limits are separate from production runtime limits.

Run npm run docker:config to validate both configurations. npm run docker:smoke starts the production Compose stack, checks readiness and stops it. It preserves data volumes. See infrastructure.md for optional build proxy configuration, logging and Redis policy.
