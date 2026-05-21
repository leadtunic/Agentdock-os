'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/store';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  CheckSquare,
  Plug,
  Puzzle,
  ScrollText,
  CreditCard,
  Users,
  ShieldCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
  Settings,
  Terminal,
  Brain,
  Wrench,
  Globe,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Organizations', href: '/organizations', icon: Building2 },
      { label: 'Projects', href: '/projects', icon: FolderKanban },
    ],
  },
  {
    label: 'Governance',
    items: [
      { label: 'Approvals', href: '/approvals', icon: CheckSquare },
      { label: 'Providers', href: '/providers', icon: Plug },
      { label: 'Plugins', href: '/plugins', icon: Puzzle },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Audit Log', href: '/audit', icon: ScrollText },
      { label: 'Costs', href: '/costs', icon: CreditCard },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Roles', href: '/admin/roles', icon: ShieldCheck },
    ],
  },
];

const projectNavItems: NavItem[] = [
  { label: 'Overview', href: 'overview', icon: LayoutDashboard },
  { label: 'Agents', href: 'agents', icon: Bot },
  { label: 'Tasks', href: 'tasks', icon: Terminal },
  { label: 'Sessions', href: 'sessions', icon: Globe },
  { label: 'Repositories', href: 'repositories', icon: FolderKanban },
  { label: 'Browser', href: 'browser', icon: Globe },
  { label: 'Memory', href: 'memory', icon: Brain },
  { label: 'Skills', href: 'skills', icon: Wrench },
  { label: 'MCP', href: 'mcp', icon: Plug },
  { label: 'Settings', href: 'settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUiStore();

  const isProjectRoute = pathname.startsWith('/projects/') && pathname !== '/projects';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-dock-border bg-dock-bg transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-dock-border px-4">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <span className="text-sm font-bold text-dock-bg">A</span>
            </div>
            <span className="text-sm font-semibold text-white">AgentDock</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-md text-dock-muted hover:bg-dock-surface hover:text-white"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {isProjectRoute ? (
          <div className="px-3">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-dock-muted">
              Project
            </p>
            <ul className="space-y-1">
              {projectNavItems.map((item) => {
                const isActive = pathname.endsWith(item.href) || (item.href === 'overview' && pathname === `/projects/${pathname.split('/')[2]}`);
                return (
                  <li key={item.href}>
                    <Link
                      href={`/projects/${pathname.split('/')[2]}/${item.href}`}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-dock-surface text-white'
                          : 'text-dock-muted hover:bg-dock-surface hover:text-white'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          navSections.map((section) => (
            <div key={section.label} className="mb-4 px-3">
              {sidebarOpen && (
                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-dock-muted">
                  {section.label}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-dock-surface text-white'
                            : 'text-dock-muted hover:bg-dock-surface hover:text-white'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {sidebarOpen && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
