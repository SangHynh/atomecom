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

export function UserEmptyState({ onClearFilters, isFiltering = true }: UserEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full" />
        <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-background to-muted/50 border border-border/50 flex items-center justify-center shadow-2xl">
          {isFiltering ? (
            <FilterX className="h-10 w-10 text-blue-600" />
          ) : (
            <SearchX className="h-10 w-10 text-blue-600" />
          )}
        </div>
      </div>
      
      <h3 className="text-xl font-black tracking-tighter uppercase mb-2">
        {t('users.empty.title')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[300px] mb-8 font-medium leading-relaxed">
        {isFiltering ? t('users.empty.desc_filters') : t('users.empty.desc_search')}
      </p>
      
      <Button 
        onClick={onClearFilters}
        variant="outline"
        className="rounded-xl font-black text-[10px] uppercase tracking-widest border-blue-600/20 text-blue-600 hover:bg-blue-600/5 hover:border-blue-600/40 transition-all gap-2"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {t('users.empty.clear_filters')}
      </Button>
    </motion.div>
  );
}
