# Contributing to AgentDock OS

Thank you for contributing.

## Development setup

```bash
git clone https://github.com/agentdock/agentdock-os.git
cd agentdock-os
cp .env.example .env
pnpm install
docker compose up -d postgres redis
pnpm dev
```

## Branch naming

```txt
feat/visual-toolbar
fix/browser-session-cleanup
docs/plugin-sdk
security/mask-provider-keys
```

## Commit style

Use conventional commits:

```txt
feat: add browser snapshot endpoint
fix: prevent agents from reading env files by default
docs: add Dokploy deployment guide
```

## Pull request checklist

- Code is typed.
- Tests were added or updated.
- Documentation was updated.
- No secrets are logged.
- Sensitive actions require approval.
- Tool permissions were considered.
- Audit events were added where needed.
