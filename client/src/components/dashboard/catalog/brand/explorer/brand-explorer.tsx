'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brand, PRODUCT_STATUS } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import {
  Maximize2 as MaximizeIcon,
  ChevronRight as ChevronRightIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { BrandCard } from './brand-card';

interface BrandExplorerProps {
  brands: Brand[];
  onView: (brand: Brand) => void;
  isLoading?: boolean;
}

export function BrandExplorer({ brands, onView, isLoading }: BrandExplorerProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius)] border border-border/40 p-5 bg-background/40 animate-pulse"
          >
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-14 w-14 rounded-[var(--radius)] border border-border" />
              <div className="flex flex-col gap-2 items-end">
                <Skeleton className="h-4 w-20 rounded-[var(--radius)]" />
                <Skeleton className="h-4 w-12 rounded-[var(--radius)]" />
              </div>
            </div>
            <Skeleton className="h-4 w-1/3 mb-2 rounded-[var(--radius)]" />
            <Skeleton className="h-3 w-1/4 mb-4 rounded-[var(--radius)]" />
            <Skeleton className="h-10 w-full mb-6 rounded-[var(--radius)]" />
            <div className="flex gap-2 border-t py-4">
              <Skeleton className="h-8 flex-1 rounded-[var(--radius)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-[var(--radius)] border-[0.5px] border-dashed border-foreground/20">
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-60">
          {t('catalog.brands.empty.title')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
      <AnimatePresence mode="popLayout">
        {brands.map((brand, index) => (
          <BrandCard
            key={brand.id}
            brand={brand}
            index={index}
            onView={onView}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}





