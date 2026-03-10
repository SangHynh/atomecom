'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronDown,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  Box,
  Tags,
  ListTree,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  subItems?: Omit<NavItem, 'icon' | 'subItems'>[];
}

export function Sidebar({ isOpen, toggle }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    '/admin/products',
  ]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href],
    );
  };

  const navItems: NavItem[] = [
    { name: t('sidebar.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('sidebar.users'), href: '/admin/users', icon: Users },
    {
      name: t('sidebar.catalog', 'Catalog'),
      href: '/admin/catalog', // Dùng làm prefix cho cha
      icon: Package,
      subItems: [
        { name: t('sidebar.products', 'Products'), href: '/admin/products' },
        { name: t('sidebar.inventory', 'Inventory'), href: '/admin/inventory' },
        {
          name: t('sidebar.categories', 'Categories'),
          href: '/admin/categories',
        },
        { name: t('sidebar.brands', 'Brands'), href: '/admin/brands' },
      ],
    },
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
            <div className="h-9 w-9 min-w-[36px] rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 ring-1 ring-white/10 shrink-0 mx-auto group hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
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
                  ATOME<span className="text-primary">COM</span>
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
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubActive =
              hasSubItems &&
              item.subItems!.some((sub) => pathname.startsWith(sub.href));
            const isActive = pathname === item.href || isSubActive;
            const isExpanded = expandedItems.includes(item.href);

            return (
              <div key={item.href} className="flex flex-col gap-1">
                {hasSubItems ? (
                  <button
                    onClick={() => {
                      if (!isOpen) toggle(); // Mở sidebar ra nếu đang thu gọn
                      toggleExpand(item.href);
                    }}
                    className={cn(
                      'flex w-full items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden h-12 z-10',
                      isActive && !isExpanded
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-sm',
                      !isOpen && 'lg:px-0 lg:justify-center lg:w-12 lg:mx-auto',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        isActive && !isExpanded
                          ? ''
                          : 'group-hover:scale-110 transition-transform',
                      )}
                    />
                    <AnimatePresence>
                      {isOpen && (
                        <>
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="font-bold text-sm tracking-tight overflow-hidden whitespace-nowrap flex-1 text-left"
                          >
                            {item.name}
                          </motion.span>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: 1,
                              rotate: isExpanded ? 180 : 0,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                    {!isOpen && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-[60]">
                        {item.name}
                      </div>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden h-12 z-10',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30'
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
                )}

                {/* Sub Menu Dropsdown */}
                <AnimatePresence>
                  {hasSubItems && isOpen && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-1 pl-11 pr-2 relative"
                    >
                      {/* Sub-menu connecting line */}
                      <div className="absolute left-6 top-0 bottom-4 w-px bg-border/50" />

                      {item.subItems!.map((subItem) => {
                        const isSubItemActive =
                          pathname === subItem.href ||
                          pathname.startsWith(subItem.href + '/');
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'flex items-center py-2 px-3 text-sm rounded-lg transition-colors relative',
                              isSubItemActive
                                ? 'text-primary font-semibold bg-primary/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                            )}
                          >
                            {/* Line pointer */}
                            <div className="absolute left-[-20px] top-1/2 w-3 h-px bg-border/50" />
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}
