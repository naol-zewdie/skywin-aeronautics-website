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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'viewer'] },
  { name: 'Products', href: '/products', icon: Package, roles: ['admin', 'operator'] },
  { name: 'Services', href: '/services', icon: Wrench, roles: ['admin', 'operator'] },
  { name: 'Careers', href: '/careers', icon: Briefcase, roles: ['admin', 'operator'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  const filteredNav = navigation.filter((item) => hasRole(item.roles));

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
          <Shield className="mr-2 h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Skywin Admin</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="border-b px-6 py-4">
        <p className="text-sm font-medium">{user?.fullName}</p>
        <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
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
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
