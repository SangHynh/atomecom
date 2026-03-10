'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Category } from '@atomecom/shared';
import { CategoryForm } from './category-form';
import { CategoryStudioPreview } from './category-studio-preview';
import { StudioOverlay } from '../studio-overlay';

interface CategoryFormOverlayProps {
  category?: Category | null; // If provided, we are editing
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  parent?: Category | null;
}

export function CategoryFormOverlay({
  category,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  parent,
}: CategoryFormOverlayProps) {
  const { t } = useTranslation();
  const isEditing = !!category;

  const leftContent = (
    <CategoryStudioPreview
      category={category}
      parent={parent}
      isEditing={isEditing}
    />
  );

  const rightContent = (
    <div className="p-8 md:p-12 lg:p-16 relative">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter">
            {isEditing
              ? t('catalog.categories.actions.edit', {
                  defaultValue: 'Cấu hình Danh mục',
                })
              : t('catalog.categories.actions.create', {
                  defaultValue: 'Khởi tạo Danh mục',
                })}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
            {t('catalog.categories.management_context', {
              defaultValue: 'Thiết lập cấu trúc phân loại',
            })}
          </p>
        </div>
      </div>

      <div className="bg-muted/10 border border-border/10 p-8 rounded-[40px] shadow-inner mb-8">
        <CategoryForm
          initialData={category || undefined}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );

  return (
    <StudioOverlay
      isOpen={isOpen}
      onClose={onClose}
      leftContent={leftContent}
      rightContent={rightContent}
      maxWidth="max-w-6xl"
    />
  );
}
