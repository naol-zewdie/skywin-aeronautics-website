'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  Briefcase,
  Settings,
  LogOut,
  Shield,
  Newspaper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'viewer'] },
  { name: 'Products', href: '/products', icon: Package, roles: ['admin', 'operator'] },
  { name: 'Services', href: '/services', icon: Wrench, roles: ['admin', 'operator'] },
  { name: 'Careers', href: '/careers', icon: Briefcase, roles: ['admin', 'operator'] },
  { name: 'Posts', href: '/posts', icon: Newspaper, roles: ['admin', 'operator'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  const filteredNav = navigation.filter((item) => hasRole(item.roles));

  return (
    <div className="flex h-full w-64 flex-col bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
          <Shield className="mr-2 h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Skywin Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 mt-8 p-4 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => window.innerWidth < 768 && (window as any).closeMobileMenu?.()}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all relative border',
                isActive
                  ? 'bg-primary/10 text-primary border-primary scale-105 px-4 py-2.5 shadow-sm'
                  : 'text-muted-foreground border-border hover:bg-accent hover:text-foreground hover:border-primary/50 hover:scale-102'
              )}
            >
              <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
          <span className="truncate">Logout</span>
        </Button>
      </div>
    </div>
  );
}
