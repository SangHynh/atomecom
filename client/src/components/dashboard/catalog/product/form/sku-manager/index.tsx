'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormSchema } from '@atomecom/shared';
import { Button } from '@/components/ui/button';
import { Plus, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkuItem } from './sku-item';

interface SkuManagerProps {
  form: UseFormReturn<ProductFormSchema>;
}

export function SkuManager({ form }: SkuManagerProps) {
  const skus = form.watch('skus') || [];

  const addSku = () => {
    form.setValue('skus', [
      ...skus,
      {
        skuCode: '',
        name: '',
        price: { basePrice: 0 },
        initialQuantity: 0,
        attributes: [],
        images: [],
        barcode: '',
      },
    ]);
  };

  const removeSku = (index: number) => {
    if (skus.length <= 1) return;
    const newSkus = skus.filter((_, i) => i !== index);
    form.setValue('skus', newSkus);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <Box className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Phiên bản & Tồn kho
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground/60 pl-6.5">
            Quản lý các biến thể sản phẩm, giá bán và số lượng nhập kho ban đầu
          </p>
        </div>
        <Button
          type="button"
          onClick={addSku}
          className="h-9 px-4 rounded-md bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-sm"
        >
          <Plus className="h-3 w-3" />
          Thêm phiên bản
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {skus.map((_, index) => (
            <motion.div
              layout
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-muted/20 border border-border/40 hover:border-border/80 rounded-md p-6 transition-all"
            >
              <SkuItem
                form={form}
                index={index}
                onRemove={removeSku}
                showRemove={skus.length > 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
