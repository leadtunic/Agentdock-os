FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/protocol/package.json packages/protocol/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/protocol/ packages/protocol/
COPY packages/shared/ packages/shared/
COPY services/agent-runtime/package.json services/agent-runtime/package.json
COPY services/agent-runtime/ services/agent-runtime/
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @agentdock/protocol build
RUN pnpm --filter @agentdock/shared build
RUN pnpm --filter @agentdock/agent-runtime build

FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/protocol/package.json packages/protocol/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/protocol/ packages/protocol/
COPY packages/shared/ packages/shared/
COPY services/agent-runtime/package.json services/agent-runtime/package.json
COPY services/agent-runtime/ services/agent-runtime/
RUN pnpm install --frozen-lockfile=false --prod
COPY --from=builder /app/services/agent-runtime/dist services/agent-runtime/dist
COPY --from=builder /app/packages/protocol/dist packages/protocol/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist
EXPOSE 8020
ENV NODE_ENV=production
CMD ["node", "services/agent-runtime/dist/index.js"]
