'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Globe, Github, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-muted/20 py-16">
      <div className="container mx-auto max-w-7xl px-8 lg:px-14">
        <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
          <div className="flex flex-col items-center gap-3 md:items-start min-w-[200px]">
            <Link
              href="/"
              className="flex items-center gap-2 cursor-pointer group"
              aria-label="Atomecom Home"
            >
              <Zap className="h-6 w-6 text-primary fill-primary transition-all duration-700 group-hover:rotate-[20deg] group-hover:drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              <span className="text-2xl font-bold tracking-tight font-heading group-hover:text-primary transition-all duration-700">
                Atomecom
              </span>
            </Link>
            <p className="text-sm text-muted-foreground font-medium">
              {t('footer.rights')}
            </p>
          </div>

          <div className="flex gap-6 items-center justify-center">
            {[
              {
                icon: <Globe className="h-6 w-6" />,
                label: 'Website',
                aria: 'Visit our Website',
              },
              {
                icon: <Github className="h-6 w-6" />,
                label: 'GitHub',
                aria: 'Visit our GitHub',
              },
              {
                icon: <Linkedin className="h-6 w-6" />,
                label: 'LinkedIn',
                aria: 'Visit our LinkedIn',
              },
            ].map((social, idx) => (
              <Button
                key={idx}
                variant="ghost"
                size="icon"
                aria-label={social.aria}
                className="h-12 w-12 rounded-full transition-all duration-500 hover:bg-primary/10 hover:text-primary hover:rotate-12 cursor-pointer shadow-sm hover:shadow-primary/20"
              >
                {social.icon}
              </Button>
            ))}
          </div>

          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-bold text-muted-foreground md:justify-end min-w-[350px]">
            {[
              { href: '#', label: t('footer.privacy') },
              { href: '#', label: t('footer.terms') },
              { href: '#', label: t('footer.contact') },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-primary transition-all duration-500 min-w-max text-center md:text-right cursor-pointer"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
