# Dockerfile for hono-sqlite production
FROM node:lts-alpine3.21 AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN apk --no-cache upgrade && npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:lts-alpine3.21 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN apk --no-cache upgrade && npm install -g pnpm && pnpm install --prod --frozen-lockfile
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/db.json ./db.json
EXPOSE 3001
CMD ["node", "dist/server.js"]
