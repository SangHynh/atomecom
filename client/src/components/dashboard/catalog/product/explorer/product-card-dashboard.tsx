'use client';

import React from 'react';
import { Product, PRODUCT_STATUS } from '@atomecom/shared';
import { Image as ImageIcon, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
}

const STATUS_DOT: Record<string, string> = {
  [PRODUCT_STATUS.PUBLISHED]: 'bg-success',
  [PRODUCT_STATUS.DRAFT]: 'bg-warning',
  [PRODUCT_STATUS.HIDDEN]: 'bg-muted-foreground/40',
  [PRODUCT_STATUS.DISCONTINUED]: 'bg-danger-soft',
};

export function ProductCard({ product, onView }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => onView(product)}
      className="group cursor-pointer relative"
    >
      {/* Image — editorial aspect ratio */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted/10 border border-border/40 rounded-[var(--radius)]">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/5" />
          </div>
        )}

        {/* Status dot — floating minimal */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-full ring-2 ring-background/50',
              STATUS_DOT[product.status] || 'bg-muted-foreground/30',
            )}
          />
          <span className="text-[8px] font-bold uppercase tracking-wide text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-[var(--radius)] opacity-0 group-hover:opacity-100 transition-opacity">
            {product.status}
          </span>
        </div>

        {/* Hover overlay — editorial thin line */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/[0.02] transition-colors duration-500 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <div className="h-12 w-12 rounded-[var(--radius)] bg-background/90 backdrop-blur-md flex items-center justify-center border border-border/40 shadow-none">
              <Eye className="h-5 w-5 text-foreground/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Content — editorial typography */}
      <div className="pt-3 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">
            {product.categoryId?.split('-')[0] || 'COLLECTION'}
          </p>
          <div className="h-px flex-1 bg-border/10 mx-4" />
        </div>

        {/* Product name — Sans pragmatic */}
        <h3 className="font-semibold text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Info Row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            {product.avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                <span className="text-[11px] font-bold tabular-nums text-foreground/70">
                  {product.avgRating.toFixed(1)}
                </span>
              </div>
            )}
            <span className="text-[10px] text-muted-foreground/50 font-medium">
              {product.totalReviews || 0} reviews
            </span>
          </div>

          <p className="text-[9px] text-muted-foreground/30 font-mono tracking-tighter">
            #{product.slug?.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Bottom rule — editorial thin divider */}
      <div className="h-[0.5px] bg-border/40 mt-2 transition-colors group-hover:bg-foreground/20" />
    </motion.div>
  );
}





