'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layout, FileEdit, Plus, Camera } from 'lucide-react';
import { Category } from '@atomecom/shared';
import { cn } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/category-icons';

interface CategoryStudioPreviewProps {
  category?: Category | null;
  parent?: Category | null;
  isEditing: boolean;
}

export function CategoryStudioPreview({
  category,
  parent,
  isEditing,
}: CategoryStudioPreviewProps) {
  const categoryIconData = getCategoryIcon(category?.icon || 'Folder');
  const CategoryIcon = categoryIconData.icon;
  const iconColor = categoryIconData.color;

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
          <Layout className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Category System
          </span>
        </div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            {isEditing ? (
              <FileEdit className="h-3 w-3" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
            {isEditing ? 'Refine Mode' : 'Draft Mode'}
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9] text-foreground transition-all">
            {isEditing ? 'Edit' : 'Create'}
            <br />
            <span className="text-muted-foreground/40 font-bold italic">
              Category
            </span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest leading-loose">
            {isEditing
              ? `Refining architecture for "${category?.name}".`
              : parent
                ? `Injecting new node into "${parent.name}".`
                : 'Establishing new Root Node (Level 1).'}
          </p>
        </div>
      </div>

      {/* Icon Visualizer */}
      <div className="relative z-10 w-full mt-8">
        <div className="p-6 rounded-[32px] bg-white dark:bg-zinc-900 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-white/10 flex flex-col items-center justify-center group relative overflow-hidden cursor-pointer">
          {/* Upload Overlay (UI Only) */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 z-20">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white">
              <Camera className="h-5 w-5" />
            </div>
          </div>

          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

          <div
            className={cn(
              'h-20 w-20 rounded-[24px] flex items-center justify-center mb-4 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 relative z-10',
              isEditing
                ? 'bg-primary text-white shadow-primary/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground shadow-black/5',
            )}
          >
            <CategoryIcon className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
