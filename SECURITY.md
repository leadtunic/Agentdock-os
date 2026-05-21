# Security Policy

Security is a core design principle of AgentDock OS.

## Reporting vulnerabilities

Please do not open public issues for security vulnerabilities. Use GitHub Security Advisories or contact the maintainers privately.

## Security principles

- Agents have no unrestricted access by default.
- Sensitive actions require approval.
- Secrets are encrypted and masked.
- Tool calls are audited.
- Destructive commands are blocked by default.
- Browser sessions are isolated by default.
- Production operations require explicit grants.
- Prompt injection is treated as a security risk.

## Sensitive actions

The following actions must require explicit approval:

- modifying environment files;
- accessing secrets;
- running shell commands with side effects;
- deleting files;
- modifying infrastructure;
- deploying to production;
- sending external messages;
- using real browser sessions;
- changing permissions;
- creating API keys;
- executing write-capable MCP tools.
