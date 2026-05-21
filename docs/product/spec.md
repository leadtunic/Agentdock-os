# AgentDock OS — Complete Product Specification

## 1. Vision

AgentDock OS is an open source, self-hosted operating system for governed AI agents. It enables teams to create, run and control agents that can work with code, browsers, Git workflows, MCP servers, message channels, memory, skills and operational automations.

The project is designed as a complete platform from the start, not a narrow MVP. Implementation is modular, but the repository structure and contracts are prepared for the final product scope.

## 2. Product Positioning

**Tagline:** Open source operating system for governed AI agents.

**Pitch:** AgentDock OS connects visual coding agents, browser automation, Git workflows, persistent memory, reusable skills, MCP Hub, message gateway, quality gates, approval workflows, audit logs and cost tracking into one self-hosted platform.

## 3. Problems Solved

1. Agents usually lack visual context when changing UI code.
2. Many AI coding tools have weak governance and auditability.
3. Agent actions are often hard to review, reproduce or explain.
4. Most platforms depend on closed SaaS infrastructure.
5. Persistent project memory and reusable skills are underdeveloped.
6. Browser automation, Git workflow, MCP, messaging and code changes are disconnected.
7. Enterprise usage requires permissions, approvals, secrets protection and logs.

## 4. Core Principles

- Self-hosted first.
- Open source core.
- Human-in-the-loop for sensitive actions.
- Governance by default.
- Audit everything relevant.
- Provider-agnostic LLM layer.
- MCP-native architecture.
- Modular services.
- Secure by default.
- Professional UX for developers and teams.

## 5. Main Modules

### 5.1 Dashboard Web

The dashboard manages organizations, projects, agents, sessions, tasks, repositories, providers, MCP servers, plugins, memory, skills, approvals, audit logs and costs.

Routes include:

```txt
/login
/dashboard
/organizations
/projects
/projects/:id/overview
/projects/:id/agents
/projects/:id/tasks
/projects/:id/sessions
/projects/:id/repositories
/projects/:id/browser
/projects/:id/memory
/projects/:id/skills
/projects/:id/mcp
/projects/:id/settings
/audit
/costs
/providers
/plugins
/admin/users
/admin/roles
```

### 5.2 Visual Dev Toolbar

A package injected into web apps. It allows users to select UI elements, capture DOM/screenshot/console/network context and create development tasks for agents.

Captured context:

- route
- DOM fragment
- CSS selector
- computed dimensions
- screenshot
- console errors
- network errors
- framework metadata when available

### 5.3 Agent Control Plane

Agents are governed runtime identities with:

- role
- system prompt
- provider/model
- tool permissions
- file permissions
- command permissions
- MCP permissions
- browser permissions
- memory scope
- cost limits
- approval policies
- skills enabled

Agent roles:

```txt
frontend_engineer
backend_engineer
fullstack_engineer
qa_engineer
security_reviewer
devops_engineer
documentation_writer
browser_operator
product_analyst
support_agent
workflow_orchestrator
```

### 5.4 Agent Runtime

Executes agent sessions. Responsibilities:

1. receive task
2. validate governance policy
3. build context
4. retrieve memories
5. load skills
6. call model provider
7. execute allowed tools
8. generate artifacts or patches
9. run quality gate
10. request approvals
11. persist audit and cost events

Session states:

```txt
created
queued
running
waiting_for_approval
waiting_for_user
completed
failed
cancelled
```

### 5.5 Browser Runtime

Playwright-powered runtime for browser inspection and automation.

Modes:

```txt
isolated_profile
user_profile_with_approval
remote_cdp
headless
headed
recorded_session
```

Actions:

- open URL
- click
- type
- select
- upload
- screenshot
- snapshot
- collect console errors
- collect network errors
- record session

### 5.6 Message Gateway

Connects agents to communication channels:

- WebChat
- Telegram
- Discord
- Slack
- Microsoft Teams
- email
- webhooks
- future WhatsApp Cloud API

Commands can create tasks, approve patches, show diffs, run checks and query status.

### 5.7 Memory Engine

Persistent memory by scope:

```txt
user_memory
organization_memory
project_memory
repository_memory
session_memory
skill_memory
decision_memory
error_memory
preference_memory
architecture_memory
```

Memories include title, content, scope, confidence, source, expiration, pinned flag and audit metadata.

### 5.8 Skills Engine

Skills are versioned reusable procedures. A skill can be written manually or generated from a successful task.

Example:

```yaml
name: debug-dokploy-traefik-502
description: Diagnose 502 errors in Dokploy/Traefik deployments.
allowed_tools:
  - shell.readonly
  - docker.inspect
  - logs.read
  - http.request
requires_approval:
  - docker.restart
  - filesystem.write
```

### 5.9 MCP Hub

MCP servers are registered, tested, permissioned and audited. Agents do not get all MCP tools globally; tool access is scoped per project and agent.

### 5.10 Git Workspace

Manages repositories, branches, worktrees, diffs, patches, commits and pull requests. Agents must work in isolated branches/worktrees and cannot modify the main branch directly.

### 5.11 Quality Gate

Checks before applying or merging changes:

- lint
- typecheck
- tests
- build
- secret scan
- permission review
- dependency review
- custom project checks

### 5.12 Governance Engine

Controls:

```txt
file_policy
command_policy
tool_policy
mcp_policy
browser_policy
cost_policy
approval_policy
channel_policy
secret_policy
```

Sensitive actions require explicit approval.

### 5.13 Security Layer

Required defaults:

- secrets encrypted at rest
- tokens masked in logs
- `.env` blocked by default
- destructive commands blocked
- browser isolated by default
- shell commands sandboxed
- MCP writes require approval
- prompt injection treated as security risk
- audit log enabled

### 5.14 Plugin System

Plugin types:

```txt
channel_plugin
tool_plugin
mcp_plugin
provider_plugin
quality_gate_plugin
browser_plugin
repository_plugin
notification_plugin
```

Plugins declare permissions in a manifest and all tool calls are auditable.

## 6. Architecture

```txt
Dashboard / Toolbar / CLI / Channels
                  |
                  v
              AgentDock API
                  |
  ------------------------------------------------
  |          |           |          |             |
Agent     Browser     Memory     MCP Hub      Gateway
Runtime   Runtime     Engine                  Runtime
  |          |           |          |             |
Git      Playwright   Skills     MCP Tools    Channels
  |
Quality Gates
  |
Audit + Cost Tracking
```

## 7. Data Model

Core tables:

```txt
users
organizations
organization_members
roles
permissions
projects
repositories
agents
agent_policies
agent_sessions
agent_messages
tasks
task_events
tool_calls
approvals
providers
provider_keys
mcp_servers
mcp_tools
plugins
skills
skill_versions
memories
browser_profiles
browser_sessions
browser_actions
git_workspaces
patches
quality_gate_runs
quality_gate_logs
pull_requests
audit_logs
cost_events
webhook_events
channel_connections
notifications
```

## 8. API Surface

Main groups:

```txt
/auth
/organizations
/projects
/agents
/tasks
/sessions
/browser
/memories
/skills
/mcp
/repositories
/quality-gates
/audit
/costs
/plugins
/providers
```

## 9. Deployment

Supported deployment modes:

- local Docker Compose
- Dokploy
- VPS with reverse proxy
- future Kubernetes profile

Default services:

```txt
web
api
agent-runtime
browser-runtime
gateway
worker
postgres
redis
minio optional
```

## 10. Roadmap

The implementation is phase-based but scoped as a complete platform:

1. repository foundation
2. core dashboard and API
3. agent runtime and tasks
4. Git workspace and quality gates
5. visual toolbar
6. browser runtime
7. memory and skills
8. MCP Hub
9. message gateway
10. production readiness

## 11. Acceptance Criteria

The complete product is acceptable when users can:

1. deploy with Docker Compose or Dokploy
2. create an organization and project
3. configure AI providers
4. create governed agents
5. connect repositories
6. create tasks
7. generate patches
8. review diffs
9. run quality gates
10. approve/reject changes
11. operate browser sessions
12. store/retrieve memories
13. execute skills
14. register MCP servers
15. use external message channels
16. inspect audit logs and cost metrics

## 12. Repository Goal

This repository contains the full planned product architecture, documentation, service boundaries, package contracts and starter implementations for all final modules. Each module is represented from the beginning to avoid an MVP-only structure that would need to be rewritten later.
