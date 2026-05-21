FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/protocol/package.json packages/protocol/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/protocol/ packages/protocol/
COPY packages/shared/ packages/shared/
COPY services/sandbox-runner/package.json services/sandbox-runner/package.json
COPY services/sandbox-runner/ services/sandbox-runner/
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @agentdock/protocol build
RUN pnpm --filter @agentdock/shared build
RUN pnpm --filter @agentdock/sandbox-runner build

FROM node:20-alpine
WORKDIR /app
RUN corepack enable
RUN apk add --no-cache bash coreutils
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/protocol/package.json packages/protocol/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/protocol/ packages/protocol/
COPY packages/shared/ packages/shared/
COPY services/sandbox-runner/package.json services/sandbox-runner/package.json
COPY services/sandbox-runner/ services/sandbox-runner/
RUN pnpm install --frozen-lockfile=false --prod
COPY --from=builder /app/services/sandbox-runner/dist services/sandbox-runner/dist
COPY --from=builder /app/packages/protocol/dist packages/protocol/dist
COPY --from=builder /app/packages/shared/dist packages/shared/dist
RUN mkdir -p /tmp/agentdock-sandbox /data
EXPOSE 8070
ENV NODE_ENV=production
ENV SANDBOX_WORKING_DIR=/tmp/agentdock-sandbox
CMD ["node", "services/sandbox-runner/dist/index.js"]
