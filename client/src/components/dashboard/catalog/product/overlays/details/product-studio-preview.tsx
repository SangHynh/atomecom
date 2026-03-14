'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, FileEdit, Plus, Camera, Archive } from 'lucide-react';
import { Product } from '@atomecom/shared';
import { cn } from '@/lib/utils';

interface ProductStudioPreviewProps {
  product?: Product | null;
  isEditing: boolean;
}

export function ProductStudioPreview({
  product,
  isEditing,
}: ProductStudioPreviewProps) {
  return (
    <div className="relative z-10 p-8 lg:p-10 w-full max-w-[380px] flex flex-col items-center sm:items-start justify-between h-full">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 w-full">
        <div className="flex items-center gap-2 mb-10 opacity-40">
          <Package className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
            Product Engine
          </span>
        </div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] bg-foreground/5 border border-border/10 text-foreground text-[10px] font-bold uppercase tracking-wider mb-4">
            {isEditing ? (
              <FileEdit className="h-3 w-3" />
            ) : (
              <Archive className="h-3 w-3" />
            )}
            {isEditing ? 'Refine Mode' : 'Detail Mode'}
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase leading-[0.9] text-foreground transition-all">
            {isEditing ? 'Edit' : 'Product'}
            <br />
            <span className="text-muted-foreground/40 font-bold italic">
              Manifest
            </span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest leading-loose">
            {isEditing
              ? `Augmenting data for "${product?.name}".`
              : `Inspecting inventory node "${product?.id.slice(0, 8)}".`}
          </p>
        </div>
      </div>

      {/* Visualizer */}
      <div className="relative z-10 w-full mt-8">
        <div className="p-6 rounded-[var(--radius)] bg-white dark:bg-card shadow-none border-[0.5px] border-border/40 flex flex-col items-center justify-center group relative overflow-hidden cursor-pointer">
          {/* Upload Overlay (UI Only if possible) */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 z-20">
            <div className="p-2.5 rounded-[var(--radius)] bg-white/20 backdrop-blur-md border-[0.5px] border-white/30 text-white">
              <Camera className="h-5 w-5" />
            </div>
          </div>

          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

          {product?.thumbnail ? (
            <div className="h-32 w-32 rounded-[var(--radius)] overflow-hidden border border-border/20 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 relative z-10">
               <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className={cn(
                'h-20 w-20 rounded-[var(--radius)] flex items-center justify-center mb-4 shadow-none transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 relative z-10',
                isEditing
                  ? 'bg-foreground text-background shadow-none border-[0.5px] border-foreground/20'
                  : 'bg-muted text-muted-foreground shadow-none border-[0.5px] border-border/40',
              )}
            >
              <Package className="h-8 w-8" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
