<p align="center">
  <img src="./apps/docs/public/agentdock-logo.svg" alt="AgentDock OS" width="112" />
</p>

<h1 align="center">AgentDock OS</h1>

<p align="center">
  Open source operating system for governed AI agents.
</p>

<p align="center">
  Build, run and govern AI agents that work with code, browser, Git, MCP, memory, skills, quality gates and automations — fully self-hosted.
</p>

<p align="center">
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/license-AGPL--3.0-blue" /></a>
  <a href="./CONTRIBUTING.md"><img alt="Contributions welcome" src="https://img.shields.io/badge/contributions-welcome-brightgreen" /></a>
  <a href="./SECURITY.md"><img alt="Security policy" src="https://img.shields.io/badge/security-policy-important" /></a>
  <a href="./ROADMAP.md"><img alt="Roadmap" src="https://img.shields.io/badge/roadmap-public-purple" /></a>
</p>

---

## What is AgentDock OS?

**AgentDock OS** is an open source, self-hosted platform for creating, running and governing AI agents. It combines visual development, browser automation, Git workflows, persistent memory, reusable skills, MCP servers, message channels, quality gates, approvals and audit logs into one modular platform.

AgentDock OS is designed for developers, internal platform teams and organizations that want useful autonomous agents without giving up control, security or ownership of infrastructure.

## Why this exists

AI agents are moving from chat to action. They can edit code, run commands, operate browsers, read repositories and call external tools. That power needs infrastructure: policies, audit logs, approvals, memory, skills, quality gates and self-hosted deployment.

AgentDock OS is not just another coding assistant. It is an operational layer for governed AI agents.

## Core capabilities

- **Visual coding agents** — select UI elements, describe changes and generate patches.
- **Browser automation** — run isolated browser sessions with screenshots, snapshots and controlled actions.
- **Git workflows** — create branches, diffs, commits and pull requests.
- **Governed agents** — define what each agent can read, write, execute and access.
- **Quality gates** — run lint, typecheck, tests, build, secret scans and custom checks.
- **Memory and skills** — persist knowledge and reuse procedures across users, projects and organizations.
- **MCP Hub** — register MCP servers with scoped tool permissions and audit logs.
- **Message gateway** — interact with agents via WebChat, Telegram, Discord, Slack, email and webhooks.
- **Audit and cost tracking** — trace prompts, tools, approvals, model usage and operational cost.
- **Self-hosted deployment** — Docker Compose and Dokploy-ready architecture.

## Quickstart

```bash
git clone https://github.com/agentdock/agentdock-os.git
cd agentdock-os
cp .env.example .env
docker compose up -d
```

Open:

```txt
Web:      http://localhost:3000
API:      http://localhost:8000
API Docs: http://localhost:8000/docs
```

## Repository structure

```txt
apps/          Web dashboard, docs site and playground
packages/      Shared packages, toolbar, SDK and protocol contracts
services/      API, agent runtime, browser runtime, memory, skills, gateway and workers
plugins/       Built-in plugin manifests and plugin skeletons
docs/          Product, architecture, deployment, security and developer docs
infra/         Docker, Dokploy, Traefik, monitoring and infra references
.github/       CI, templates, CODEOWNERS and project automation
```

## Documentation

- [Product Specification](./SPEC.md)
- [Getting Started](./docs/getting-started.md)
- [Architecture Overview](./docs/architecture/overview.md)
- [System Design](./docs/architecture/system-design.md)
- [Security Model](./docs/architecture/security-model.md)
- [Docker Deployment](./docs/deployment/docker-compose.md)
- [Dokploy Deployment](./docs/deployment/dokploy.md)
- [Plugin SDK](./docs/plugin-sdk/overview.md)
- [Roadmap](./ROADMAP.md)

## License

AgentDock OS is licensed under **AGPL-3.0-only**. Commercial licensing can be added later for organizations that need different terms.
