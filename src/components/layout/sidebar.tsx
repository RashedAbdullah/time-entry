// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  FolderKanban,
  Clock,
  BarChart3,
  Settings,
  Users,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/',
      active: pathname === '/',
    },
    {
      label: 'Projects',
      icon: FolderKanban,
      href: '/projects',
      active: pathname.startsWith('/projects'),
    },
    {
      label: 'Time Entries',
      icon: Clock,
      href: '/time-entries',
      active: pathname.startsWith('/time-entries'),
    },
    {
      label: 'Reports',
      icon: BarChart3,
      href: '/reports',
      active: pathname.startsWith('/reports'),
    },
    {
      label: 'Team',
      icon: Users,
      href: '/team',
      active: pathname.startsWith('/team'),
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform",
          !isOpen && "-translate-x-full md:translate-x-0"
        )}
      >
        <ScrollArea className="h-full py-4">
          <nav className="space-y-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={onClose}
              >
                <Button
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    route.active && "bg-secondary"
                  )}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Button>
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}