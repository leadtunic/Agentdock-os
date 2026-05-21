FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/protocol/package.json packages/protocol/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/protocol/ packages/protocol/
COPY packages/shared/ packages/shared/
COPY services/memory-engine/package.json services/memory-engine/package.json
COPY services/memory-engine/ services/memory-engine/
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @agentdock/protocol build
RUN pnpm --filter @agentdock/shared build
RUN pnpm --filter @agentdock/memory-engine build

FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/protocol/package.json packages/protocol/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/protocol/ packages/protocol/
COPY packages/shared/ packages/shared/
COPY services/memory-engine/package.json services/memory-engine/package.json
COPY services/memory-engine/ services/memory-engine/
RUN pnpm install --frozen-lockfile=false --prod
COPY --from=builder /app/services/memory-engine/dist services/memory-engine/dist
COPY --from=builder /app/packages/protocol/dist packages/protocol/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist
EXPOSE 8050
ENV NODE_ENV=production
CMD ["node", "services/memory-engine/dist/index.js"]
