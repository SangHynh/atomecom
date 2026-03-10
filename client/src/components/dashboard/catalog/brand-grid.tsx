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

interface BrandGridProps {
  brands: Brand[];
  onView: (brand: Brand) => void;
  isLoading?: boolean;
}

export function BrandGrid({ brands, onView, isLoading }: BrandGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-border/40 p-5 bg-background/40 animate-pulse"
          >
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-5 w-2/3 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-6" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/60">
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
