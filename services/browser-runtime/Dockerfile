FROM mcr.microsoft.com/playwright:v1.49.0-jammy AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/protocol/package.json packages/protocol/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/protocol/ packages/protocol/
COPY packages/shared/ packages/shared/
COPY services/browser-runtime/package.json services/browser-runtime/package.json
COPY services/browser-runtime/ services/browser-runtime/
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @agentdock/protocol build
RUN pnpm --filter @agentdock/shared build
RUN pnpm --filter @agentdock/browser-runtime build

FROM mcr.microsoft.com/playwright:v1.49.0-jammy
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/protocol/package.json packages/protocol/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/protocol/ packages/protocol/
COPY packages/shared/ packages/shared/
COPY services/browser-runtime/package.json services/browser-runtime/package.json
COPY services/browser-runtime/ services/browser-runtime/
RUN pnpm install --frozen-lockfile=false --prod
COPY --from=builder /app/services/browser-runtime/dist services/browser-runtime/dist
COPY --from=builder /app/packages/protocol/dist packages/protocol/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist
RUN mkdir -p /data/browser
EXPOSE 8010
ENV NODE_ENV=production
ENV BROWSER_STORAGE_PATH=/data/browser
CMD ["node", "services/browser-runtime/dist/index.js"]
