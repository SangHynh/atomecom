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
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Box className="h-4 w-4 text-foreground/40" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
            Hệ thống phiên bản & Tồn kho (SKU Engine)
          </h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSku}
          className="h-8 px-4 text-[9px] font-black uppercase tracking-widest gap-2 rounded-none border-border/40 hover:bg-foreground hover:text-background transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Thêm phiên bản
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <AnimatePresence mode="popLayout" initial={false}>
          {skus.map((_, index) => (
            <motion.div
              layout
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="group relative bg-muted/5 border border-border/20 hover:border-border/40 rounded-[var(--radius)] p-10 transition-all"
            >
              <div className="absolute top-4 left-4 flex items-center gap-3">
                <span className="h-6 w-6 flex items-center justify-center bg-foreground text-background text-[10px] font-black rounded-none shadow-xl">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.15em]">
                  Variant Active
                </span>
              </div>
              
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

      {skus.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border/20 rounded-[var(--radius)] bg-muted/5 group hover:bg-muted/10 transition-all cursor-pointer" onClick={addSku}>
          <div className="h-12 w-12 rounded-full border border-border/20 border-dashed flex items-center justify-center mb-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all">
            <Box className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.2em] mb-6">
            Chưa có thông tin phiên bản kho hàng
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-6 text-[9px] font-black uppercase tracking-widest rounded-none border-border/40 hover:bg-foreground hover:text-background transition-all"
          >
            Khởi tạo phiên bản định danh đầu tiên
          </Button>
        </div>
      )}
    </div>
  );
}





