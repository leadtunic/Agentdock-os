const features = [
  {
    title: 'Governed agents',
    description: 'Define permissions, budgets, tool access and approval policies per agent, project and organization.',
  },
  {
    title: 'Browser + Git execution',
    description: 'Combine Playwright sessions, isolated worktrees, patch generation and quality gates in one flow.',
  },
  {
    title: 'Persistent memory and skills',
    description: 'Store project knowledge, reusable procedures and execution history across runs.',
  },
  {
    title: 'MCP and channels',
    description: 'Register MCP servers and receive tasks or approvals through webchat, Slack, Telegram and more.',
  },
];

const highlights = [
  'Self-hosted deployment',
  'Human-in-the-loop approvals',
  'Audit logs and cost tracking',
  'Provider-agnostic LLM layer',
  'Quality gates before merge',
  'Plugin SDK and extensibility',
];

const docs = [
  { href: '/getting-started', label: 'Getting Started' },
  { href: '/architecture/overview', label: 'Architecture' },
  { href: '/security/overview', label: 'Security' },
  { href: '/plugin-sdk/overview', label: 'Plugin SDK' },
];

const metrics = [
  { value: '20+', label: 'product modules' },
  { value: '7', label: 'provider options' },
  { value: '11', label: 'agent roles' },
  { value: '1', label: 'self-hosted platform' },
];

const story = [
  {
    step: '01',
    title: 'Define the boundary',
    description: 'Create organizations, projects, providers and governed agents with explicit permissions and budgets.',
  },
  {
    step: '02',
    title: 'Execute with control',
    description: 'Route tasks into browser, Git, MCP and sandboxed execution with approvals before sensitive actions.',
  },
  {
    step: '03',
    title: 'Learn and improve',
    description: 'Persist memory, version skills, inspect audit trails and refine quality gates as the platform scales.',
  },
];

const audiences = [
  'Platform teams standardizing AI operations',
  'Developer teams shipping UI and backend changes',
  'Open source maintainers with self-hosted needs',
  'Organizations that require approvals, logs and cost visibility',
];

const principles = [
  'Governance by default',
  'Audit every sensitive action',
  'Provider-agnostic by design',
  'Self-hosted infrastructure ownership',
];

export default function DocsHome() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px 20px 56px',
        background:
          'radial-gradient(circle at top left, rgba(183,174,143,0.12), transparent 28%), radial-gradient(circle at top right, rgba(124,58,237,0.12), transparent 24%), linear-gradient(180deg, #0b0d12 0%, #090b0f 100%)',
      }}
    >
      <style jsx global>{`
        @keyframes floatGlow {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.72; }
          50% { transform: translateY(-10px) scale(1.03); opacity: 1; }
        }
        @keyframes sheen {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
      <section
        style={{
          position: 'relative',
          maxWidth: 1280,
          margin: '0 auto',
          border: '1px solid rgba(55,65,81,0.8)',
          borderRadius: 36,
          background: 'linear-gradient(180deg, rgba(20,24,31,0.96) 0%, rgba(12,14,19,0.98) 100%)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
        >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 20% 10%, rgba(183,174,143,0.12), transparent 22%), radial-gradient(circle at 80% 15%, rgba(124,58,237,0.15), transparent 20%)',
            animation: 'floatGlow 8s ease-in-out infinite',
          }}
        />
        <div style={{ padding: '40px clamp(24px, 4vw, 64px) 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <img src="/agentdock-logo.svg" alt="AgentDock OS logo" width={72} height={72} style={{ borderRadius: 20 }} />
            <div>
              <div style={{ color: '#b7ae8f', fontSize: 14, letterSpacing: 1.4, textTransform: 'uppercase' }}>AgentDock OS</div>
              <div style={{ color: '#f4f3ef', fontSize: 20, fontWeight: 700 }}>Open source operating system for governed AI agents</div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 26,
              padding: '12px 16px',
              borderRadius: 18,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ color: '#cfc9bb', fontSize: 14, lineHeight: 1.7, maxWidth: 760 }}>
              A platform for teams that need agents to act across code, browser, Git, MCP and channels with governance, approvals and auditability.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {principles.map((principle) => (
                <span
                  key={principle}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(183,174,143,0.18)',
                    color: '#e7e5df',
                    background: 'rgba(255,255,255,0.03)',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.9,
                  }}
                >
                  {principle}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: 28,
              alignItems: 'center',
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(44px, 6vw, 84px)', lineHeight: 0.95, letterSpacing: -2 }}>
                Governed agents for real work.
              </h1>
              <p style={{ marginTop: 24, maxWidth: 760, fontSize: 22, lineHeight: 1.6, color: '#d6d3c7' }}>
                Build, run and govern AI agents across code, browser, Git, MCP, memory, skills and approvals in a fully self-hosted control plane.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
                {highlights.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(183,174,143,0.18)',
                      color: '#e7e5df',
                      fontSize: 14,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 12,
                  marginTop: 34,
                }}
              >
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 20,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontSize: 30, fontWeight: 800, color: '#f4f3ef' }}>{metric.value}</div>
                    <div style={{ fontSize: 13, color: '#b7ae8f', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 34 }}>
                <a
                  href="/getting-started"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 160,
                    padding: '14px 20px',
                    borderRadius: 14,
                    background: 'linear-gradient(120deg, #b7ae8f 0%, #d3c8a1 50%, #b7ae8f 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'sheen 6s linear infinite',
                    color: '#111111',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 12px 30px rgba(183,174,143,0.18)',
                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                  }}
                >
                  Get started
                </a>
                <a
                  href="/architecture/overview"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 160,
                    padding: '14px 20px',
                    borderRadius: 14,
                    border: '1px solid rgba(209,213,219,0.2)',
                    color: '#f4f3ef',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'transform 180ms ease, border-color 180ms ease, background 180ms ease',
                  }}
                >
                  Read architecture
                </a>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div
                style={{
                  borderRadius: 28,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              >
                <img src="/agentdock-presentation.svg" alt="AgentDock OS presentation" style={{ width: '100%', display: 'block' }} />
              </div>

              <div
                style={{
                  borderRadius: 24,
                  padding: 24,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ color: '#b7ae8f', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase' }}>Included modules</div>
                <p style={{ margin: '12px 0 0', color: '#e7e5df', lineHeight: 1.7 }}>
                  Dashboard, API, agent runtime, browser runtime, gateway, worker, Git workspace, quality gates, memory, skills, MCP Hub, plugin SDK and more.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 44, padding: '0 clamp(24px, 4vw, 64px) 44px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {features.map((feature) => (
              <article
                key={feature.title}
                style={{
                  padding: 24,
                  borderRadius: 24,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  minHeight: 180,
                  backdropFilter: 'blur(12px)',
                  transition: 'transform 180ms ease, border-color 180ms ease, background 180ms ease',
                }}
              >
                <h2 style={{ margin: 0, fontSize: 24 }}>{feature.title}</h2>
                <p style={{ marginTop: 14, color: '#cfc9bb', lineHeight: 1.65 }}>{feature.description}</p>
              </article>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 28,
              borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(183,174,143,0.08), rgba(124,58,237,0.06))',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ color: '#b7ae8f', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase' }}>Why now</div>
            <h2 style={{ margin: '10px 0 0', fontSize: 30 }}>Agents are becoming operational systems, not just prompts.</h2>
            <p style={{ marginTop: 14, color: '#d6d3c7', lineHeight: 1.8, maxWidth: 900 }}>
              AgentDock OS brings governance, runtime boundaries and a public product structure to a category that is usually assembled from disconnected scripts, workflows and one-off integrations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, marginTop: 18 }}>
            <section
              style={{
                padding: 28,
                borderRadius: 24,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
              >
                <h2 style={{ margin: 0, fontSize: 28 }}>Why teams choose it</h2>
                <p style={{ color: '#d6d3c7', lineHeight: 1.8, marginTop: 16 }}>
                  AgentDock OS is built for teams that need agents to do operational work with traceability, approvals and scoped permissions, while keeping the deployment self-hosted and adaptable.
                </p>
              </section>

            <section
              style={{
                padding: 28,
                borderRadius: 24,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
              >
                <h2 style={{ margin: 0, fontSize: 28 }}>Explore the docs</h2>
                <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                  {docs.map((doc) => (
                  <a
                    key={doc.href}
                    href={doc.href}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 16,
                      textDecoration: 'none',
                      color: '#f4f3ef',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {doc.label}
                  </a>
                  ))}
                </div>
              </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18, marginTop: 18 }}>
            <section
              style={{
                padding: 28,
                borderRadius: 24,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ color: '#b7ae8f', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase' }}>Platform story</div>
              <h2 style={{ margin: '10px 0 0', fontSize: 28 }}>From intent to governed execution</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 20 }}>
                {story.map((item) => (
                  <div
                    key={item.step}
                    style={{
                      padding: 22,
                      borderRadius: 20,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ color: '#b7ae8f', fontSize: 13, letterSpacing: 1.5 }}>{item.step}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 10 }}>{item.title}</div>
                    <p style={{ color: '#d6d3c7', lineHeight: 1.7, marginTop: 12 }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section
              style={{
                padding: 28,
                borderRadius: 24,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ color: '#b7ae8f', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase' }}>Built for</div>
              <h2 style={{ margin: '10px 0 0', fontSize: 28 }}>Teams that need power without losing control</h2>
              <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                {audiences.map((audience) => (
                  <div
                    key={audience}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#f4f3ef',
                    }}
                  >
                    {audience}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 30,
              borderRadius: 26,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ color: '#b7ae8f', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase' }}>Ready to explore</div>
              <h2 style={{ margin: '10px 0 0', fontSize: 28 }}>A complete platform, ready for real agent operations.</h2>
              <p style={{ margin: '10px 0 0', color: '#d6d3c7', lineHeight: 1.7 }}>
                Start with the dashboard, read the architecture, or use the quickstart to run the stack locally.
              </p>
            </div>
            <a
              href="/getting-started"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 180,
                padding: '14px 22px',
                borderRadius: 14,
                background: '#f4f3ef',
                color: '#111111',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Open the quickstart
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
