'use client';

import React from 'react';
import { extractData } from '@/lib/api-utils';
import { Product } from '@atomecom/shared';
import { X, Pencil, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSkusByProduct } from '@/hooks/use-skus';
import { motion, AnimatePresence } from 'framer-motion';
import { OverviewSection } from './detail-tabs/overview-section';
import { InventorySection } from './detail-tabs/inventory-section';
import { DetailsSection } from './detail-tabs/details-section';

interface ProductDetailOverlayProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 lg:p-12 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/40 backdrop-blur-[24px] cursor-zoom-out"
          />

          {/* Centered Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 30 }}
            className="relative w-full h-full md:h-[90vh] max-w-6xl bg-background border-[0.5px] border-border/40 rounded-none md:rounded-md shadow-2xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground leading-none">
                    Chi tiết sản phẩm
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    Mã sản phẩm:{' '}
                    <span className="font-mono">
                      {product.id.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="h-9 px-4 rounded-md border-border/60 font-bold uppercase tracking-wider text-[10px] gap-2"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-9 w-9 rounded-md hover:bg-muted/10 border border-border/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

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
                    Ngày tạo
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
                  className="text-xs font-bold uppercase tracking-wider text-destructive/60 hover:text-destructive hover:bg-destructive/5"
                >
                  Xóa sản phẩm
                </Button>
                <Button
                  onClick={() => onEdit(product)}
                  className="h-11 px-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-xs gap-2"
                >
                  Chỉnh sửa ngay
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
