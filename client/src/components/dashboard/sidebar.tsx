'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  PackageSearch,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronDown,
  BarChart3,
  ShieldCheck,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [expandedItems, setExpandedItems] = useState<string[]>([
    '/admin/catalog',
  ]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href],
    );
  };

  const navItems: NavItem[] = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Người dùng', href: '/admin/users', icon: Users },
    {
      name: 'Danh mục hàng hóa',
      href: '/admin/catalog',
      icon: PackageSearch,
      subItems: [
        { name: 'Sản phẩm', href: '/admin/products' },
        { name: 'Phân loại', href: '/admin/categories' },
        { name: 'Thương hiệu', href: '/admin/brands' },
      ],
    },
    { name: 'Quản lý tồn kho', href: '/admin/inventory', icon: Warehouse },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Thống kê dữ liệu', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Thiết lập hệ thống', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-background/40 backdrop-blur-md z-40 lg:hidden transition-opacity duration-500',
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
          width: isOpen ? 260 : 80,
          x: isOpen
            ? 0
            : typeof window !== 'undefined' && window.innerWidth < 1024
              ? -260
              : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className={cn(
          'fixed inset-y-0 left-0 bg-background border-r-[0.5px] border-border/40 z-50 flex flex-col shadow-none',
        )}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 shrink-0 relative">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 min-w-[40px] rounded-sm bg-foreground flex items-center justify-center shrink-0 border border-transparent group hover:bg-transparent hover:border-foreground/20 transition-all duration-500">
              <ShieldCheck className="text-background group-hover:text-foreground h-5 w-5 transition-colors" />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-2xl tracking-tight text-foreground whitespace-nowrap pt-1"
                >
                  AtomEcom.
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className={cn(
              'absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background border border-border/40 shadow-none hover:bg-muted hidden lg:flex items-center justify-center transition-transform duration-500',
              !isOpen && 'rotate-180',
            )}
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground/40" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navItems.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubActive =
              hasSubItems &&
              item.subItems!.some((sub) => pathname.startsWith(sub.href));
            const isActive = pathname === item.href || isSubActive;
            const isExpanded = expandedItems.includes(item.href);

            return (
              <div key={item.href} className="space-y-1">
                {hasSubItems ? (
                  <button
                    onClick={() => {
                      if (!isOpen) toggle();
                      toggleExpand(item.href);
                    }}
                    className={cn(
                      'flex w-full items-center gap-4 px-3 h-11 rounded-sm transition-all duration-300 group relative',
                      isActive && !isExpanded
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/30',
                      !isOpen && 'justify-center px-0',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform duration-500',
                        !isActive && 'group-hover:scale-110',
                      )}
                    />
                    <AnimatePresence>
                      {isOpen && (
                        <>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-[10px] font-bold uppercase tracking-wider flex-1 text-left pt-0.5"
                          >
                            {item.name}
                          </motion.span>
                          <ChevronDown
                            className={cn(
                              'h-3 w-3 transition-transform duration-500',
                              isExpanded && 'rotate-180',
                            )}
                          />
                        </>
                      )}
                    </AnimatePresence>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-4 px-3 h-11 rounded-sm transition-all duration-300 group relative',
                      isActive
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/30',
                      !isOpen && 'justify-center px-0',
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 transition-transform duration-500 group-hover:scale-110" />
                    <AnimatePresence>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-[10px] font-bold uppercase tracking-wider pt-0.5"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                )}

                <AnimatePresence>
                  {hasSubItems && isOpen && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-1 pl-11 pr-2 mt-1 relative"
                    >
                      <div className="absolute left-6 top-0 bottom-4 w-[1px] bg-border/20" />
                      {item.subItems!.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              'h-9 flex items-center px-4 text-[9px] font-bold uppercase tracking-wide rounded-sm transition-all relative',
                              isSubActive
                                ? 'text-foreground bg-muted/20'
                                : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted/10',
                            )}
                          >
                            <div
                              className={cn(
                                'absolute left-[-20px] top-1/2 w-4 h-[1px] transiton-colors duration-500',
                                isSubActive
                                  ? 'bg-foreground/20'
                                  : 'bg-border/10',
                              )}
                            />
                            {sub.name}
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

        {/* Status Area */}
        <div className="p-4 border-t border-border/40 shrink-0">
          <div
            className={cn(
              'h-12 flex items-center gap-4 transition-all duration-500 rounded-sm border-[0.5px] border-transparent hover:bg-muted/5 group cursor-pointer',
              isOpen ? 'px-4' : 'justify-center px-0',
            )}
          >
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">
                  Trạng thái kết nối
                </span>
                <span className="text-[8px] font-semibold text-emerald-500/60 uppercase">
                  Đang hoạt động tốt
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
