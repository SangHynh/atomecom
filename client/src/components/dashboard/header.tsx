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

interface HeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="h-16 bg-background/40 backdrop-blur-xl border-b border-border/40 sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Placeholder */}
        <div className="hidden md:flex items-center gap-2 bg-muted/30 border border-border/40 px-4 py-2 rounded-xl w-64 lg:w-96 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/30 transition-all">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('header.search_placeholder')}
            className="bg-transparent border-none focus:outline-none text-xs w-full font-bold uppercase tracking-tight"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <button className="p-2 rounded-xl hover:bg-muted transition-all relative group">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            <span className="absolute top-2 right-2.5 h-2 w-2 bg-blue-500 rounded-full border-2 border-background shadow-sm" />
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
                <p className="text-xs font-black tracking-tight uppercase leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  {user?.role}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border-border/50 shadow-2xl backdrop-blur-md bg-background/90"
          >
            <DropdownMenuLabel className="font-bold">
              {t('header.my_account')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="focus:bg-primary/10 rounded-lg cursor-pointer font-medium">
              {t('header.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-primary/10 rounded-lg cursor-pointer font-medium">
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
