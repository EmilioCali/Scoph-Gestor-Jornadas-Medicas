# Imagen única: SPA + nginx + cuatro Fastify. Mongo y secretos van fuera.
FROM node:22-alpine AS frontend
WORKDIR /web
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
COPY scoph-frontend/package.json scoph-frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY scoph-frontend/ ./
ENV VITE_AUTH_SERVICE_URL=/auth
ENV VITE_WORKDAY_SERVICE_URL=/workday
ENV VITE_CORE_SERVICE_URL=/core
ENV VITE_REPORTS_SERVICE_URL=/report
RUN mkdir -p public && cp src/assets/logo.png public/logo.png
RUN pnpm build

FROM node:22-alpine AS auth-deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
COPY auth-service/package.json auth-service/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:22-alpine AS workday-deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
COPY workday-service/package.json workday-service/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:22-alpine AS core-deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
COPY core-service/package.json core-service/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:22-alpine AS report-deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
COPY report-service/package.json report-service/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache nginx supervisor gettext \
    && mkdir -p /app/www /run/nginx /var/log/nginx /var/lib/nginx/tmp

COPY --from=auth-deps /app/node_modules /app/auth-service/node_modules
COPY auth-service/package.json /app/auth-service/package.json
COPY auth-service/src /app/auth-service/src

COPY --from=workday-deps /app/node_modules /app/workday-service/node_modules
COPY workday-service/package.json /app/workday-service/package.json
COPY workday-service/src /app/workday-service/src

COPY --from=core-deps /app/node_modules /app/core-service/node_modules
COPY core-service/package.json /app/core-service/package.json
COPY core-service/src /app/core-service/src

COPY --from=report-deps /app/node_modules /app/report-service/node_modules
COPY report-service/package.json /app/report-service/package.json
COPY report-service/src /app/report-service/src

COPY --from=frontend /web/dist /app/www
COPY deploy/nginx.conf.template deploy/supervisord.conf deploy/entrypoint.sh /app/deploy/
RUN chmod +x /app/deploy/entrypoint.sh

EXPOSE 10000
CMD ["/app/deploy/entrypoint.sh"]
