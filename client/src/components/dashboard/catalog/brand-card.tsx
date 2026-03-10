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
      className="group relative rounded-2xl border border-border/60 bg-background shadow-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full min-h-[280px] p-5 overflow-hidden"
    >
      {/* Ribbon Status Badge - Corner Wrap Style */}
      <div className="absolute -top-1 -right-1 w-32 h-32 overflow-hidden z-20 pointer-events-none">
        <div
          className={cn(
            'absolute top-[22px] -right-[34px] w-[160px] py-1 shadow-lg text-center rotate-[45deg] text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all duration-500',
            (brand as any).status === PRODUCT_STATUS.PUBLISHED &&
              'bg-primary shadow-primary/30',
            (brand as any).status === PRODUCT_STATUS.DRAFT &&
              'bg-zinc-500 shadow-zinc-500/30',
            (brand as any).status === PRODUCT_STATUS.HIDDEN &&
              'bg-amber-500 shadow-amber-500/30',
            (brand as any).status === PRODUCT_STATUS.DISCONTINUED &&
              'bg-rose-500 shadow-rose-500/30',
            !(brand as any).status && 'bg-primary shadow-primary/30',
          )}
          style={{
            boxShadow:
              '0 4px 10px rgba(0,0,0,0.15), inset 0 0 10px rgba(255,255,255,0.2)',
          }}
        >
          {/* Fold Effect Shadow */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/10" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />

          {(brand as any).status || PRODUCT_STATUS.PUBLISHED}
        </div>
      </div>

      {/* Brand Logo & Basic Info */}
      <div className="flex flex-col gap-5 flex-1">
        <div className="relative w-fit">
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Avatar className="h-16 w-16 rounded-xl border-2 border-background ring-1 ring-border/40 shadow-lg relative z-10 bg-white transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
            <AvatarImage
              src={brand.logo}
              alt={brand.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white font-black text-xl">
              {brand.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div>
          <h3 className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 truncate pr-16">
            {brand.name}
          </h3>
          <p className="font-mono text-[11px] text-muted-foreground/60 font-bold leading-none mt-1.5 flex items-center gap-1">
            <span className="text-primary/40">@</span>
            {brand.slug}
          </p>
        </div>

        <div className="mt-1 min-h-[42px]">
          <p className="text-[11px] text-muted-foreground/80 line-clamp-2 font-medium leading-relaxed border-l-2 border-primary/10 pl-3 group-hover:border-primary/30 transition-colors">
            {brand.description ||
              t('catalog.brands.form.description_placeholder')}
          </p>
        </div>

        <div className="pt-5 border-t border-border/40 flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 mt-auto">
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            Registration
          </span>
          <span className="text-foreground/60 font-mono">
            {format(new Date(brand.createdAt), 'dd.MM.yyyy')}
          </span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-5">
        <Button
          className="w-full bg-secondary/50 dark:bg-muted/20 hover:bg-primary hover:text-white border-none rounded-xl h-10 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-300 group/btn shadow-none hover:shadow-lg hover:shadow-primary/20 text-muted-foreground hover:text-white"
          onClick={() => onView(brand)}
        >
          {t('common.view_details', { defaultValue: 'View Details' })}
          <ChevronRightIcon className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </Button>
      </div>
    </motion.div>
  );
}
