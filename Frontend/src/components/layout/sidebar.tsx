'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings2,
  Shield,
  FileText,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Student Roster', icon: Users },
  { href: '/optimizer', label: 'Resource Optimizer', icon: Settings2 },
];

const legalItems = [
  { href: '/privacy', label: 'Privacy Policy', icon: Shield },
  { href: '/terms', label: 'Terms & Conditions', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-neutral-800/80 bg-neutral-950">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-neutral-800/80 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-800">
          <Activity className="h-4 w-4 text-neutral-300" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-neutral-100">
          NEXUS
        </span>
        <span className="ml-auto rounded bg-neutral-800/80 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
          v3.0
        </span>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 space-y-0.5 px-3 pt-4">
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-neutral-600">
          Platform
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-150',
                isActive
                  ? 'bg-neutral-800/60 text-neutral-100'
                  : 'text-neutral-500 hover:bg-neutral-800/30 hover:text-neutral-300'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-neutral-300' : 'text-neutral-600'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Legal Nav */}
      <div className="border-t border-neutral-800/80 px-3 py-3">
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-neutral-600">
          Legal
        </p>
        {legalItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors duration-150',
                isActive
                  ? 'text-neutral-300'
                  : 'text-neutral-600 hover:text-neutral-400'
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-800/80 px-5 py-3">
        <p className="text-[11px] text-neutral-600">
          &copy; {new Date().getFullYear()} NEXUS Analytics
        </p>
      </div>
    </aside>
  );
}
