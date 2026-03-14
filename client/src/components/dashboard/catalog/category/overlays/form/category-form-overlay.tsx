'use client';

import React from 'react';
import { Category, CategorySchema } from '@atomecom/shared';
import { CategoryForm } from './category-form';
import { StudioOverlay } from '@/components/dashboard/studio/studio-overlay';
import { Tag } from 'lucide-react';

interface CategoryFormOverlayProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategorySchema) => void;
  isLoading?: boolean;
}

export function CategoryFormOverlay({
  category,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CategoryFormOverlayProps) {
  const leftContent = (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="h-20 w-20 rounded-[var(--radius)] bg-foreground/5 flex items-center justify-center mb-4">
        <Tag className="h-10 w-10 text-foreground/20" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest mb-1">Cấu trúc phân loại</h3>
      <p className="text-[10px] text-muted-foreground uppercase font-bold opacity-40">Category Taxonomy Protocol</p>
    </div>
  );

  const rightContent = (
    <div className="flex-1 overflow-y-auto">
      <CategoryForm
        category={category || undefined}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </div>
  );

  return (
    <StudioOverlay
      isOpen={isOpen}
      onClose={onClose}
      leftContent={leftContent}
      rightContent={rightContent}
      maxWidth="max-w-5xl"
    />
  );
}





