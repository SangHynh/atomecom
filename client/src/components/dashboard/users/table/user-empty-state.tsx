'use client';

import React from 'react';
import { SearchX, FilterX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface UserEmptyStateProps {
  onClearFilters: () => void;
  isFiltering?: boolean;
}

export function UserEmptyState({
  onClearFilters,
  isFiltering = true,
}: UserEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-info/10 blur-3xl rounded-full" />
        <div className="relative h-24 w-24 rounded-[var(--radius)]-3xl bg-gradient-to-br from-background to-muted/50 border border-border/50 flex items-center justify-center shadow-none">
          {isFiltering ? (
            <FilterX className="h-10 w-10 text-info" />
          ) : (
            <SearchX className="h-10 w-10 text-info" />
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold tracking-tight uppercase mb-2">
        {t('users.empty.title')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[300px] mb-8 font-medium leading-relaxed">
        {isFiltering
          ? t('users.empty.desc_filters')
          : t('users.empty.desc_search')}
      </p>

      <Button
        onClick={onClearFilters}
        variant="outline"
        className="rounded-[var(--radius)] font-bold text-[10px] uppercase tracking-wide border-info/20 text-info hover:bg-info/5 hover:border-info/40 transition-all gap-2"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {t('users.empty.clear_filters')}
      </Button>
    </motion.div>
  );
}





