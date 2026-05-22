import Image from 'next/image';
import Link from 'next/link';
import { Activity, Bot, GitBranch, ShieldCheck, Workflow, Wrench, ArrowRight, Clock3, Sparkles, Layers3, Lock, PanelTop, Database } from 'lucide-react';

const modules = [
  { title: 'Governed Agents', icon: Bot, description: 'Roles, policies, tools, approvals and runtime limits.' },
  { title: 'Visual Dev Toolbar', icon: Wrench, description: 'Capture DOM context and turn UI intent into safe tasks.' },
  { title: 'Browser Runtime', icon: Activity, description: 'Isolated Playwright sessions, snapshots and diagnostics.' },
  { title: 'Git Workspaces', icon: GitBranch, description: 'Branches, diffs, patches, commits and pull requests.' },
  { title: 'MCP + Plugins', icon: Workflow, description: 'Scoped tool access with audit logs and approvals.' },
  { title: 'Security First', icon: ShieldCheck, description: 'Human approval, sandboxing, secret masking and policies.' },
];

const metrics = [
  { value: '20+', label: 'product modules' },
  { value: '11', label: 'agent roles' },
  { value: '7', label: 'provider options' },
  { value: '1', label: 'self-hosted platform' },
];

const story = [
  { step: '01', title: 'Set policy', text: 'Define orgs, projects, agents, budgets and permissions before execution begins.' },
  { step: '02', title: 'Run work', text: 'Let agents act across browser, Git, MCP and memory with human approvals for sensitive actions.' },
  { step: '03', title: 'Review proof', text: 'Inspect quality gates, audit logs and cost tracking after every meaningful action.' },
];

const stack = [
  { icon: PanelTop, title: 'Dashboard', text: 'A control surface for teams and admins.' },
  { icon: Database, title: 'API + data', text: 'FastAPI backend, PostgreSQL, Redis and governed workflows.' },
  { icon: Layers3, title: 'Runtime layers', text: 'Agent, browser, gateway, worker and sandbox runtimes.' },
  { icon: Lock, title: 'Governance', text: 'Approvals, audit trails, file policies and command controls.' },
  { icon: Sparkles, title: 'Memory + skills', text: 'Persistent context and reusable procedures.' },
  { icon: Clock3, title: 'Ops visibility', text: 'Cost tracking, quality gates and health checks.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(183,174,143,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(124,58,237,0.12),_transparent_25%),linear-gradient(180deg,#0b0d12_0%,#090b0f_100%)] text-[#f4f3ef]">
      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,24,31,0.96)_0%,rgba(12,14,19,0.98)_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(circle_at_20%_10%,rgba(183,174,143,0.12),transparent_22%),radial-gradient(circle_at_80%_15%,rgba(124,58,237,0.15),transparent_20%)]" />

          <div className="relative z-10 px-6 pb-10 pt-10 lg:px-12 lg:pt-12">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/3 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Image src="/agentdock-logo.svg" alt="AgentDock OS logo" width={52} height={52} className="rounded-xl" />
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-[#b7ae8f]">AgentDock OS</div>
                  <div className="text-sm text-white/90">Open source operating system for governed AI agents</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-white/70">
                <span className="rounded-full border border-white/10 px-3 py-2">Governance first</span>
                <span className="rounded-full border border-white/10 px-3 py-2">Self-hosted</span>
                <span className="rounded-full border border-white/10 px-3 py-2">MCP-native</span>
                <span className="rounded-full border border-white/10 px-3 py-2">Audit-ready</span>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#d8cfb8]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Full platform for governed agent operations
                </div>

                <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Governed agents for real work.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
                  Build, run and govern AI agents across code, browser, Git, MCP, memory, skills and approvals in a self-hosted control plane designed for teams.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-[#d6c9a1] px-5 py-3.5 font-semibold text-[#111111] transition-transform hover:-translate-y-0.5">
                    Open dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/projects" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white/90 transition-colors hover:bg-white/8">
                    Explore modules
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold text-white">{metric.value}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#b7ae8f]">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/3 shadow-2xl">
                  <Image src="/agentdock-presentation.svg" alt="AgentDock OS presentation" width={1400} height={900} className="h-auto w-full" priority />
                </div>

                <div className="rounded-[1.75rem] border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
                  <div className="text-xs uppercase tracking-[0.22em] text-[#b7ae8f]">Platform principles</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {['Self-hosted ownership', 'Provider agnostic', 'Human approvals', 'Auditable actions'].map((item) => (
                      <div key={item} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-white/85">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {story.map((item) => (
                <article key={item.step} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-5 backdrop-blur-sm transition-transform hover:-translate-y-1">
                  <div className="text-xs uppercase tracking-[0.25em] text-[#b7ae8f]">{item.step}</div>
                  <h2 className="mt-3 text-xl font-semibold text-white">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/70">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article key={module.title} className="rounded-[1.75rem] border border-dock-border bg-[#171613] p-6 transition-transform hover:-translate-y-1">
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-6 w-6 text-dock-muted" />
                  <div className="rounded-full border border-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">Module</div>
                </div>
                <h2 className="mt-5 text-xl font-medium text-white">{module.title}</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-400">{module.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[1.75rem] border border-white/8 bg-white/4 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-[#b7ae8f]">Platform stack</div>
            <h2 className="mt-3 text-2xl font-semibold text-white">One platform, many surfaces.</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {stack.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                    <Icon className="h-5 w-5 text-[#d6c9a1]" />
                    <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/8 bg-white/4 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-[#b7ae8f]">Why it matters</div>
            <h2 className="mt-3 text-2xl font-semibold text-white">Agents need boundaries, not just prompts.</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              AgentDock OS turns agentic work into an operational system with governance, auditability, approvals, cost visibility and runtime separation.
            </p>
            <div className="mt-5 space-y-3">
              {[
                'Quality gates before changes are applied or merged',
                'Scoped browser sessions and isolated worktrees',
                'Memory and skills that persist across projects',
                'Plugin, MCP and provider layers with permissions',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/8 bg-white/4 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-[#b7ae8f]">Ready to start</div>
              <h2 className="mt-3 text-2xl font-semibold text-white">Self-hosted, governed, and built as a real platform.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
                Start with the dashboard, read the architecture, or deploy the full stack locally.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/getting-started" className="inline-flex items-center gap-2 rounded-2xl bg-[#f4f3ef] px-5 py-3 font-semibold text-[#111111] transition-transform hover:-translate-y-0.5">
                Quickstart <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/docs" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/90 transition-colors hover:bg-white/8">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
