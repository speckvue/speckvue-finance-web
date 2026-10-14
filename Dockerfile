# syntax=docker/dockerfile:1
# All configurable values are supplied from .env by Compose or scripts/docker.ts.
ARG NODE_IMAGE
FROM ${NODE_IMAGE} AS base
WORKDIR /app
ARG NEXT_TELEMETRY_DISABLED
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

FROM base AS dependencies
ARG DOCKER_HUSKY
ENV HUSKY=$DOCKER_HUSKY
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit --no-fund

FROM dependencies AS development
ARG DOCKER_UID
ARG DOCKER_GID
ARG DOCKER_LOG_DIRECTORY
RUN mkdir -p "${DOCKER_LOG_DIRECTORY}" && chown "$DOCKER_UID:$DOCKER_GID" "${DOCKER_LOG_DIRECTORY}" && chmod 750 "${DOCKER_LOG_DIRECTORY}"
ARG DEV_NODE_ENV
ENV NODE_ENV=$DEV_NODE_ENV
COPY --chown=${DOCKER_UID}:${DOCKER_GID} . .
RUN mkdir -p /app/.next && chown "$DOCKER_UID:$DOCKER_GID" /app /app/.next
USER $DOCKER_UID:$DOCKER_GID
CMD ["npm", "run", "dev", "--", "--webpack"]

FROM dependencies AS builder
ARG PROD_NODE_ENV
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ENV NODE_ENV=$PROD_NODE_ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN mkdir -p public
RUN node_modules/.bin/tsx scripts/collect-licenses.ts
RUN node node_modules/next/dist/bin/next build

FROM base AS production
ARG PROD_NODE_ENV
ARG APP_PORT
ARG DOCKER_HOSTNAME
ARG DOCKER_UID
ARG DOCKER_GID
ARG DOCKER_LOG_DIRECTORY
ARG HEALTHCHECK_HOST
ARG HEALTHCHECK_TIMEOUT_MS
ENV NODE_ENV=$PROD_NODE_ENV PORT=$APP_PORT HOSTNAME=$DOCKER_HOSTNAME \
    HEALTHCHECK_HOST=$HEALTHCHECK_HOST HEALTHCHECK_TIMEOUT_MS=$HEALTHCHECK_TIMEOUT_MS
RUN groupadd --gid "$DOCKER_GID" nextjs && useradd --uid "$DOCKER_UID" --gid nextjs --no-create-home nextjs
COPY --from=builder --chown=$DOCKER_UID:$DOCKER_GID /app/.next/standalone ./
COPY --from=builder --chown=$DOCKER_UID:$DOCKER_GID /app/.next/static ./.next/static
COPY --from=builder --chown=$DOCKER_UID:$DOCKER_GID /app/public ./public
COPY --chown=$DOCKER_UID:$DOCKER_GID scripts/healthcheck.ts ./scripts/healthcheck.ts
COPY --chown=$DOCKER_UID:$DOCKER_GID LICENSE THIRD_PARTY_NOTICES.md ./
COPY --from=builder --chown=$DOCKER_UID:$DOCKER_GID /app/THIRD_PARTY_LICENSES.txt ./
RUN mkdir -p /app/.next/cache "${DOCKER_LOG_DIRECTORY}" && chown "$DOCKER_UID:$DOCKER_GID" /app/.next/cache "${DOCKER_LOG_DIRECTORY}" && chmod 750 "${DOCKER_LOG_DIRECTORY}"
USER $DOCKER_UID:$DOCKER_GID
EXPOSE $APP_PORT
HEALTHCHECK CMD ["node", "scripts/healthcheck.ts"]
CMD ["node", "server.js"]
