'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface BreadcrumbItem {
  label: string;
  href: string;
  active: boolean;
}

interface BreadcrumbsProps {
  extraItems?: BreadcrumbItem[];
}

export function Breadcrumbs({ extraItems }: BreadcrumbsProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const pathSegments = pathname.split('/').filter((segment) => segment);

  const getLabel = (segment: string) => {
    const key = `breadcrumbs.${segment.toLowerCase()}`;
    const translated = t(key);
    if (translated === key) {
      // Fallback for catalog specific segments if they don't have separate breadcrumb keys
      const sidebarKey = `sidebar.${segment.toLowerCase()}`;
      const sidebarTranslated = t(sidebarKey);
      if (sidebarTranslated !== sidebarKey) return sidebarTranslated;

      return segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return translated;
  };

  // Logic to inject "Catalog" if we are in products/brands/categories etc.
  const catalogSegments = ['products', 'brands', 'categories', 'inventory'];
  let breadcrumbItems = pathSegments.slice(1).flatMap((segment, index) => {
    if (segment.startsWith('(')) return [];

    const items = [];
    const isCatalogItem = catalogSegments.includes(segment.toLowerCase());

    // Inject Catalog parent if it's the first time we hit a catalog item
    if (
      isCatalogItem &&
      !pathSegments
        .slice(1, index + 1)
        .some((s) => s.toLowerCase() === 'catalog')
    ) {
      items.push({
        label: t('sidebar.catalog'),
        href: '#', // Catalog doesn't have a direct page usually
        active: false,
      });
    }

    items.push({
      label: getLabel(segment),
      href: `/${pathSegments.slice(0, index + 2).join('/')}`,
      active: index === pathSegments.length - 2 && !extraItems,
    });

    return items;
  });

  // Append extra items if provided
  if (extraItems && extraItems.length > 0) {
    breadcrumbItems = [...breadcrumbItems, ...extraItems];
  }

  return (
    <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
      <Link
        href="/admin"
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <Home className="h-3 w-3" />
        {t('breadcrumbs.admin', { defaultValue: 'Admin' })}
      </Link>

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={`${item.href}-${index}`}>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <Link
            href={item.href}
            className={cn(
              'transition-colors hover:text-primary',
              item.active
                ? 'text-foreground font-black'
                : 'text-muted-foreground',
            )}
            onClick={(e) => {
              if (item.href === '#') e.preventDefault();
              (item as any).onClick?.(e);
            }}
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}
