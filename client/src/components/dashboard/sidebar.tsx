'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  ChevronLeft,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export function Sidebar({ isOpen, toggle }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { name: t('sidebar.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('sidebar.users'), href: '/admin/users', icon: Users },
    { name: t('sidebar.products'), href: '/admin/products', icon: Package },
    { name: t('sidebar.orders'), href: '/admin/orders', icon: ShoppingCart },
    { name: t('sidebar.analytics'), href: '/admin/analytics', icon: BarChart3 },
    { name: t('sidebar.settings'), href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300',
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
        onClick={toggle}
      />

      {/* Sidebar Content */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen
            ? 280
            : typeof window !== 'undefined' && window.innerWidth >= 1024
              ? 80
              : 280,
          x: isOpen
            ? 0
            : typeof window !== 'undefined' && window.innerWidth >= 1024
              ? 0
              : -280,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed inset-y-0 left-0 bg-background dark:bg-zinc-950 border-r border-border z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col',
        )}
      >
        {/* Mobile Spacer - Avoids Toggle overlap */}
        <div className="h-16 lg:hidden shrink-0" />

        {/* Logo Area */}
        <div
          className={cn(
            'flex items-center h-16 shrink-0 transition-all duration-300 px-6',
            isOpen ? 'justify-between' : 'justify-center px-0',
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden z-10">
            <div className="h-9 w-9 min-w-[36px] rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 ring-1 ring-white/10 shrink-0 mx-auto group hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 overflow-hidden whitespace-nowrap"
                >
                  ATOME<span className="text-violet-600">COM</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Toggle Button - Floating Position */}
          <div className="hidden lg:block">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className={cn(
                'rounded-full hover:bg-muted/50 flex items-center justify-center transition-all bg-background border border-border/50 shadow-sm z-[70]',
                isOpen
                  ? 'h-8 w-8 relative'
                  : 'h-7 w-7 absolute -right-3.5 top-4.5',
              )}
            >
              <motion.div
                animate={{ rotate: isOpen ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft
                  className={cn('h-4 w-4', !isOpen && 'h-3.5 w-3.5')}
                />
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden h-12 z-10',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-sm',
                  !isOpen && 'lg:px-0 lg:justify-center lg:w-12 lg:mx-auto',
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive
                      ? ''
                      : 'group-hover:scale-110 transition-transform',
                  )}
                />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-bold text-sm tracking-tight overflow-hidden whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-[60]">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}
