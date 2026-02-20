'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const pathSegments = pathname.split('/').filter((segment) => segment);

  const getLabel = (segment: string) => {
    // Check if translation exists for the segment
    const key = `users.breadcrumbs.${segment.toLowerCase()}`;
    const translated = t(key);
    
    // If translated is same as key, it means it's not found (default i18next behavior)
    // or if it returns blank. We fallback to capitalized segment.
    if (translated === key) {
      return segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return translated;
  };

  return (
    <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
      <Link
        href="/admin"
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <Home className="h-3 w-3" />
        {t('users.breadcrumbs.admin')}
      </Link>
      {pathSegments.slice(1).map((segment, index) => {
        // Handle (dashboard) group in path if it appears
        if (segment.startsWith('(')) return null;

        const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
        const isLast = index === pathSegments.length - 2;
        const label = getLabel(segment);

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <Link
              href={href}
              className={cn(
                'transition-colors hover:text-primary',
                isLast ? 'text-foreground font-black' : 'text-muted-foreground'
              )}
            >
              {label}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
