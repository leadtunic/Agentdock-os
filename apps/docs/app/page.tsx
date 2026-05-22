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
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          border: '1px solid rgba(55,65,81,0.8)',
          borderRadius: 36,
          background: 'linear-gradient(180deg, rgba(20,24,31,0.96) 0%, rgba(12,14,19,0.98) 100%)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
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
                    background: '#b7ae8f',
                    color: '#111111',
                    fontWeight: 700,
                    textDecoration: 'none',
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
                }}
              >
                <h2 style={{ margin: 0, fontSize: 24 }}>{feature.title}</h2>
                <p style={{ marginTop: 14, color: '#cfc9bb', lineHeight: 1.65 }}>{feature.description}</p>
              </article>
            ))}
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
        </div>
      </section>
    </main>
  );
}
