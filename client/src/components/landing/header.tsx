'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import { LanguageSelector } from '@/components/language-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { MobileMenu } from './mobile-menu';
import { Tooltip } from '@/components/ui/tooltip';

export function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#vision', label: t('nav.vision') },
    { href: '#solutions', label: t('nav.solutions') },
    { href: '#architecture', label: t('nav.architecture') },
    { href: '#tech-stack', label: t('nav.tech_stack') },
  ];

  return (
    <motion.header
      initial={{ y: -15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500',
        isScrolled
          ? 'border-b bg-background/70 backdrop-blur-xl py-3 shadow-sm'
          : 'border-b-transparent bg-transparent py-5',
      )}
    >
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-6 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
          aria-label="Atomecom Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-500 group-hover:scale-115 group-hover:rotate-[10deg] group-hover:shadow-primary/40">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-heading group-hover:text-primary transition-colors duration-500">
            Atomecom
          </h1>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground/80 transition-all hover:text-primary rounded-lg cursor-pointer group"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-1.5 left-4 right-4 h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0 justify-end">
          <div className="flex items-center bg-muted/40 p-1 rounded-full border border-border/40 scale-90 sm:scale-100">
            <LanguageSelector />
            <div className="w-[1px] h-4 bg-border/40 mx-1" />
            <ThemeToggle />
          </div>

          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300"
                >
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="h-9 px-5 rounded-full shadow-md shadow-primary/20 font-semibold transition-all active:scale-95 hover:scale-105 text-sm cursor-pointer duration-300">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* User Identity Section */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-muted/30 border border-border/20 shadow-sm transition-all hover:bg-muted/50 cursor-default">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group/avatar">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                    />
                  ) : (
                    <span className="text-[10px] font-black text-primary tracking-tighter uppercase">
                      {user?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </span>
                  )}
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl" />
                </div>
                <div className="hidden lg:flex flex-col items-start -space-y-0.5">
                  <span className="text-sm font-bold text-foreground max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {user?.isVerified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 fill-emerald-500/10" />
                        <span className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider">
                          {t('nav.verified')}
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-3 w-3 text-amber-500 fill-amber-500/10" />
                        <span className="text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">
                          {t('nav.unverified')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Logout Action */}
              <Tooltip content={t('nav.logout')} side="right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  aria-label="Logout"
                  className="h-9 w-9 rounded-xl border border-destructive/10 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white cursor-pointer transition-all active:scale-95 group/logout shadow-sm"
                >
                  <LogOut className="h-4 w-4 transition-all group-hover/logout:-translate-x-0.5 group-hover/logout:text-white" />
                </Button>
              </Tooltip>
            </div>
          )}

          <MobileMenu navLinks={navLinks} />
        </div>
      </div>
    </motion.header>
  );
}
