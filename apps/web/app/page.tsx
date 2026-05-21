import { Activity, Bot, GitBranch, ShieldCheck, Workflow, Wrench } from 'lucide-react';

const modules = [
  { title: 'Governed Agents', icon: Bot, description: 'Roles, policies, tools, approvals and runtime limits.' },
  { title: 'Visual Toolbar', icon: Wrench, description: 'Select UI elements and turn visual context into safe code tasks.' },
  { title: 'Browser Runtime', icon: Activity, description: 'Playwright-powered browser sessions, snapshots and diagnostics.' },
  { title: 'Git Workspaces', icon: GitBranch, description: 'Branches, diffs, patches, commits and pull requests.' },
  { title: 'MCP + Plugins', icon: Workflow, description: 'Govern MCP servers and plugin tools with audit logs.' },
  { title: 'Security First', icon: ShieldCheck, description: 'Human approval, sandboxing, secret masking and policy checks.' }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dock-bg">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
        <div className="rounded-[2rem] border border-dock-border bg-dock-surface p-10 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-dock-muted">AgentDock OS</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-white">
            Open source operating system for governed AI agents.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Create, run and govern agents that work with code, browser, Git, MCP, memory, skills, quality gates and automations — fully self-hosted.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-neutral-300">
            <span className="rounded-full border border-dock-border px-4 py-2">Self-hosted</span>
            <span className="rounded-full border border-dock-border px-4 py-2">MCP-native</span>
            <span className="rounded-full border border-dock-border px-4 py-2">Human approvals</span>
            <span className="rounded-full border border-dock-border px-4 py-2">Audit logs</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article key={module.title} className="rounded-3xl border border-dock-border bg-[#171613] p-6">
                <Icon className="h-6 w-6 text-dock-muted" />
                <h2 className="mt-4 text-xl font-medium text-white">{module.title}</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">{module.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
