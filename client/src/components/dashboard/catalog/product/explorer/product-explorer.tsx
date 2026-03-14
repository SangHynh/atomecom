'use client';

import React from 'react';
import { Product } from '@atomecom/shared';
import { ProductCard } from './product-card-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface ProductExplorerProps {
  products: Product[];
  isLoading: boolean;
  onView: (product: Product) => void;
}

export function ProductExplorer({ products, isLoading, onView }: ProductExplorerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/5] w-full rounded-[var(--radius)]" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="font-bold text-2xl text-foreground/40">Danh sách trống</p>
        <p className="text-[10px] text-muted-foreground/50 mt-2 uppercase tracking-wide font-bold">
          Bắt đầu tạo sản phẩm đầu tiên của bạn
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.04 }}
        >
          <ProductCard product={product} onView={onView} />
        </motion.div>
      ))}
    </div>
  );
}





