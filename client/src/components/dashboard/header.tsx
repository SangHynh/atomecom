'use client';

import React from 'react';
import { Menu, Search, Bell, User, Command } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
  isOpen: boolean;
}

export function AdminHeader({ onMenuClick, isOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b-[0.5px] border-border/40 sticky top-0 z-30 px-8 flex items-center justify-between shadow-none">
      <div className="flex items-center gap-8 w-full">
        {/* Search Bar - Minimalist Archive Focus */}
        <div
          className={cn(
            'hidden md:flex items-center gap-3 border-b border-border/10 px-2 py-2 w-full max-w-[320px] focus-within:border-primary transition-all duration-500 group',
            !isOpen && 'lg:ml-6',
          )}
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu..."
            className="bg-transparent border-none focus:outline-none text-[10px] uppercase font-bold tracking-wide w-full placeholder:text-muted-foreground/30 transition-all text-foreground pt-0.5"
          />
          <div className="hidden lg:flex items-center gap-1.5 px-1.5 py-0.5 border border-border/20 rounded-md">
            <Command className="h-2.5 w-2.5 text-muted-foreground/40" />
            <span className="text-[8px] font-bold text-muted-foreground/40">
              K
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <ThemeToggle />
          <button className="h-9 w-9 flex items-center justify-center hover:bg-muted/30 transition-all rounded-md relative group">
            <Bell className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-primary rounded-full border-2 border-background" />
          </button>
        </div>

        <div className="h-6 w-[0.5px] bg-border/40" />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-3.5 pl-2 py-1 rounded-md hover:bg-muted/30 transition-all group">
              <div className="h-10 w-10 rounded-md bg-foreground/5 flex items-center justify-center border border-border/20 overflow-hidden group-hover:border-primary/20 transition-colors shadow-none">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-bold uppercase tracking-wide text-foreground leading-tight">
                  {user?.name || 'QUẢN TRỊ VIÊN'}
                </p>
                <p className="text-[8px] text-muted-foreground/50 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {user?.role || 'QUẢN LÝ HỆ THỐNG'}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-md border border-border/40 shadow-none bg-background/95 backdrop-blur-xl p-1.5"
          >
            <DropdownMenuLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/40 px-3 py-2.5">
              Kiểm soát tài khoản
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/10 mx-2" />
            <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground rounded-md cursor-pointer text-[9px] font-bold uppercase tracking-wide px-3 py-2.5 transition-colors">
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground rounded-md cursor-pointer text-[9px] font-bold uppercase tracking-wide px-3 py-2.5 transition-colors">
              Nhật ký bảo mật
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/10 mx-2" />
            <DropdownMenuItem
              className="focus:bg-rose-500 focus:text-white rounded-md cursor-pointer text-[9px] font-bold uppercase tracking-wide text-rose-500 px-3 py-2.5 transition-colors"
              onClick={() => logout()}
            >
              Đăng xuất phiên làm việc
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
