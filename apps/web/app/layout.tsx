import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'AgentDock OS',
  description: 'Open source operating system for governed AI agents. Self-hosted control plane for code, browser, Git, MCP, memory, skills and approvals.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
        <body className="antialiased">
          <Providers>{children}</Providers>
        </body>
    </html>
  );
}
