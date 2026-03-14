'use client';

import React from 'react';
import { extractData } from '@/lib/api-utils';
import { Product } from '@atomecom/shared';
import { X, Pencil, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSkusByProduct } from '@/hooks/use-skus';
import { motion, AnimatePresence } from 'framer-motion';
import { OverviewSection } from './sections/overview-section';
import { InventorySection } from './sections/inventory-section';
import { DetailsSection } from './sections/details-section';

interface ProductDetailOverlayProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

import { ProductStudioPreview } from './product-studio-preview';
import { StudioOverlay } from '@/components/dashboard/studio/studio-overlay';

export function ProductDetailOverlay({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ProductDetailOverlayProps) {
  const { data: skusData } = useSkusByProduct(
    isOpen && product ? product.id : null,
  );
  const skus = extractData(skusData) || [];

  if (!product) return null;

  const leftContent = <ProductStudioPreview product={product} isEditing={false} />;

  const rightContent = (
    <div className="flex flex-col h-full">
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-12 pb-10">
          <OverviewSection product={product} />
          <div className="h-px bg-border/20" />
          <InventorySection skus={skus} />
          <div className="h-px bg-border/20" />
          <DetailsSection product={product} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="h-20 px-6 border-t border-border/40 bg-muted/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase text-muted-foreground/40 tracking-wider">
              Giao thức tạo lập
            </span>
            <span className="text-[10px] font-bold text-muted-foreground font-mono">
              {new Date(product.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="text-[9px] font-black uppercase tracking-widest text-destructive/60 hover:text-destructive hover:bg-destructive/5"
          >
            Xử lý tiêu hủy
          </Button>
          <Button
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="h-10 px-8 rounded-none font-black uppercase tracking-widest text-[10px] gap-2 shadow-none"
          >
            Nâng cấp thông tin
          </Button>
        </div>
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





