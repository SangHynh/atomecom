'use client';

import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <header className="h-16 bg-background dark:bg-zinc-950 border-b border-border sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {/* Search Bar - Fixed Responsiveness with Safe Margin */}
        <div
          className={cn(
            'hidden md:flex items-center gap-3 bg-muted/20 hover:bg-muted/30 border border-border/40 px-4 py-2 rounded-2xl w-full max-w-[280px] lg:max-w-lg focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/40 focus-within:bg-background transition-all duration-300 group shadow-sm',
            !isOpen && 'lg:ml-10',
          )}
        >
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300" />
          <input
            type="text"
            placeholder={t('header.search_placeholder')}
            className="bg-transparent border-none focus:outline-none text-[13px] w-full font-medium placeholder:text-muted-foreground/50 transition-all"
          />
          <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/40 shadow-inner group-focus-within:opacity-0 transition-opacity">
            <span className="text-[10px] font-bold text-muted-foreground opacity-60">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <button className="p-2 rounded-xl hover:bg-muted transition-all relative group">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="absolute top-2 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-background shadow-sm" />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-border/50 hidden sm:block mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-3 p-1 rounded-xl hover:bg-muted/50 transition-all">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold tracking-tight text-foreground leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                  {user?.role}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border-border/50 shadow-2xl backdrop-blur-2xl bg-background/80"
          >
            <DropdownMenuLabel className="font-bold">
              {t('header.my_account')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary rounded-lg cursor-pointer font-medium transition-colors">
              {t('header.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary rounded-lg cursor-pointer font-medium transition-colors">
              {t('header.settings')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="focus:bg-primary/10 rounded-lg cursor-pointer font-medium text-rose-500 focus:text-rose-500"
              onClick={() => logout()}
            >
              {t('header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
