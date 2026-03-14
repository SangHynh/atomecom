'use client';

import React from 'react';
import { ProductForm } from './product-form';
import { Product } from '@atomecom/shared';
import { StudioOverlay } from '@/components/dashboard/studio/studio-overlay';
import { Package } from 'lucide-react';

interface ProductFormOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Product | null;
  isLoading?: boolean;
}

export function ProductFormOverlay({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: ProductFormOverlayProps) {
  const leftContent = (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="h-20 w-20 rounded-[var(--radius)] bg-foreground/5 flex items-center justify-center mb-4">
        <Package className="h-10 w-10 text-foreground/20" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest mb-1">Hệ thống kho vận</h3>
      <p className="text-[10px] text-muted-foreground uppercase font-bold opacity-40">Product Inventory Protocol</p>
    </div>
  );

  const rightContent = (
    <div className="flex-1 overflow-y-auto">
      <ProductForm
        initialData={initialData || undefined}
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
      maxWidth="max-w-7xl"
    />
  );
}





