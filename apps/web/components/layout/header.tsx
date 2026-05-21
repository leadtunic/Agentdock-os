'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/organizations': 'Organizations',
  '/projects': 'Projects',
  '/approvals': 'Approvals',
  '/providers': 'Providers',
  '/plugins': 'Plugins',
  '/audit': 'Audit Log',
  '/costs': 'Costs',
  '/admin/users': 'Users',
  '/admin/roles': 'Roles',
};

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  let title = routeTitles[pathname] || 'AgentDock';

  if (pathname.startsWith('/projects/') && pathname !== '/projects') {
    const parts = pathname.split('/');
    if (parts.length >= 4) {
      const section = parts[3];
      if (section) {
        title = section.charAt(0).toUpperCase() + section.slice(1);
      }
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-dock-border bg-dock-bg px-6">
      <h1 className="text-lg font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="px-2 py-2">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-dock-muted">{user?.email || 'user@example.com'}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
