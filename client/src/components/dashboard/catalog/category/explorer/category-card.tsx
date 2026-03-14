'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Category, PRODUCT_STATUS } from '@atomecom/shared';
import { Folder, Eye as EyeIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  onView: (category: Category) => void;
  onNavigate: (path: string | null) => void;
  draggedId?: string | null;
  dragOverPath?: string | null;
  canMoveCategory?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent, path: string | null) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetPath: string | null) => void;
}

export function CategoryCard({
  category,
  onView,
  onNavigate,
  draggedId,
  dragOverPath,
  canMoveCategory,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: CategoryCardProps) {
  const status = category.status || PRODUCT_STATUS.PUBLISHED;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable={canMoveCategory}
      onDragStart={(e) =>
        canMoveCategory &&
        onDragStart?.(e as unknown as React.DragEvent, category.id)
      }
      onDragEnd={() => canMoveCategory && onDragEnd?.()}
      onDragOver={(e) =>
        canMoveCategory &&
        onDragOver?.(e as unknown as React.DragEvent, category.path)
      }
      onDragLeave={(e) =>
        canMoveCategory && onDragLeave?.(e as unknown as React.DragEvent)
      }
      onDrop={(e) =>
        canMoveCategory &&
        onDrop?.(e as unknown as React.DragEvent, category.path)
      }
      className={cn(
        'group relative flex flex-col p-8 rounded-[var(--radius)] border border-border/10 bg-background/50 hover:bg-foreground transition-all duration-700 overflow-hidden cursor-pointer shadow-none',
        draggedId === category.id && 'opacity-50 border-dashed',
        dragOverPath === category.path &&
          'bg-foreground ring-1 ring-foreground scale-[1.02] z-10',
      )}
      onClick={() => onNavigate(category.path)}
    >
      {/* Header: Icon & Metadata */}
      <div className="flex items-start justify-between mb-8">
        <div className="h-10 w-10 rounded-[var(--radius)] bg-foreground/5 flex items-center justify-center border border-border/10 group-hover:bg-background group-hover:text-foreground transition-colors duration-500 shadow-none">
          {category.image &&
          (category.image.startsWith('http') ||
            category.image.startsWith('/')) ? (
            <img
              src={category.image}
              alt=""
              className="w-7 h-7 object-contain p-0.5"
            />
          ) : (
            <Folder className="h-4 w-4 fill-current opacity-40 shrink-0" />
          )}
        </div>
        <div className="flex flex-col items-end gap-2 pt-1 transition-colors group-hover:text-background">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none group-hover:text-background/40">
            LEVEL {category.level}
          </div>
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-none transition-all duration-500 border border-transparent',
              status === PRODUCT_STATUS.PUBLISHED
                ? 'bg-success'
                : 'bg-muted-foreground/30',
              'group-hover:bg-background group-hover:border-background/20'
            )}
          />
        </div>
      </div>

      {/* Title & Info */}
      <div className="flex-1">
        <h4 className="font-black text-[17px] text-foreground group-hover:text-background leading-tight line-clamp-2 mb-3 transition-colors duration-500 uppercase tracking-tight">
          {category.name}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground/40 group-hover:text-background/20 font-black font-mono tracking-tighter uppercase transition-colors">
            /{category.slug}
          </span>
          {status !== PRODUCT_STATUS.PUBLISHED && (
            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 bg-muted/20 px-1.5 py-0.5 rounded-none group-hover:bg-background/10 group-hover:text-background/60">
              HIDDEN
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-10 pt-5 border-t border-border/10 group-hover:border-background/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-foreground/40 group-hover:text-background/60">
          EXPLORE REPO <ArrowRight className="h-3 w-3 stroke-[3]" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 border border-border/10 bg-transparent group-hover:bg-background group-hover:text-foreground transition-all rounded-[var(--radius)] shadow-none"
          onClick={(e) => {
            e.stopPropagation();
            onView(category);
          }}
        >
          <EyeIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Subtle border accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}





