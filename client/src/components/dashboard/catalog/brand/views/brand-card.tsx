'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brand, PRODUCT_STATUS } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import {
  Maximize2 as MaximizeIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BrandCardProps {
  brand: Brand;
  index: number;
  onView: (brand: Brand) => void;
}

export function BrandCard({ brand, index, onView }: BrandCardProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group relative rounded-md border border-border/10 bg-background shadow-none hover:border-foreground/20 transition-all duration-500 flex flex-col h-full min-h-[280px] p-5 overflow-hidden"
    >
      {/* Ribbon Status Badge - Corner Wrap Style */}
      <div className="absolute -top-1 -right-1 w-32 h-32 overflow-hidden z-20 pointer-events-none">
        <div
          className={cn(
            'absolute top-[22px] -right-[34px] w-[160px] py-1 shadow-none text-center rotate-[45deg] text-[9px] font-bold uppercase tracking-wide text-white transition-all duration-500',
            brand.status === PRODUCT_STATUS.PUBLISHED &&
              'bg-foreground text-background',
            brand.status === PRODUCT_STATUS.DRAFT && 'bg-muted-foreground',
            brand.status === PRODUCT_STATUS.HIDDEN && 'bg-zinc-500 text-white',
            brand.status === PRODUCT_STATUS.DISCONTINUED &&
              'bg-destructive text-white',
            !brand.status && 'bg-foreground text-background',
          )}
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* Fold Effect Shadow */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/10" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />

          {brand.status || t('common.active', { defaultValue: 'ACTIVE' })}
        </div>
      </div>

      {/* Brand Logo & Basic Info */}
      <div className="flex flex-col gap-5 flex-1">
        <div className="relative w-fit">
          <div className="absolute inset-0 bg-foreground/5 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Avatar className="h-14 w-14 rounded-md border border-border/20 shadow-none relative z-10 bg-white transition-transform duration-500 group-hover:scale-105">
            <AvatarImage
              src={brand.logo}
              alt={brand.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-muted text-foreground font-semibold text-lg">
              {brand.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div>
          <h3 className="font-semibold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 truncate pr-16">
            {brand.name}
          </h3>
          <p className="font-mono text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tight mt-0.5 flex items-center gap-1">
            <span className="text-muted-foreground/30">ID:</span>
            {brand.slug}
          </p>
        </div>

        <div className="mt-1 min-h-[42px]">
          <p className="text-[12px] text-muted-foreground/80 line-clamp-2 font-medium leading-relaxed border-l-[1px] border-foreground/10 pl-3 group-hover:border-foreground/30 transition-colors">
            {brand.description ||
              t('catalog.brands.form.description_placeholder')}
          </p>
        </div>

        <div className="pt-4 border-t border-border/10 flex items-center justify-between text-[9px] uppercase font-bold tracking-wide text-muted-foreground/30 mt-auto">
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-sm bg-muted-foreground/30" />
            Join Date
          </span>
          <span className="text-foreground/40 font-mono">
            {format(new Date(brand.createdAt), 'dd.MM.yyyy')}
          </span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-5">
        <Button
          className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-md h-10 text-[10px] font-bold uppercase tracking-wide transition-all duration-300 group/btn shadow-none flex items-center justify-between px-4"
          onClick={() => onView(brand)}
        >
          {t('common.view_details', { defaultValue: 'View Details' })}
          <ChevronRightIcon className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 opacity-40 transition-transform duration-300" />
        </Button>
      </div>
    </motion.div>
  );
}
