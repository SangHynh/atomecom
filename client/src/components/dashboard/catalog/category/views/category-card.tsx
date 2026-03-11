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
        'group relative flex flex-col p-6 rounded-md border border-border/20 bg-background hover:bg-muted/5 transition-all duration-700 overflow-hidden cursor-pointer shadow-none',
        draggedId === category.id && 'opacity-50 border-dashed',
        dragOverPath === category.path &&
          'bg-foreground/5 ring-1 ring-foreground scale-[1.02] z-10',
      )}
      onClick={() => onNavigate(category.path)}
    >
      {/* Header: Icon & Metadata */}
      <div className="flex items-start justify-between mb-6">
        <div className="h-10 w-10 rounded-md bg-foreground/5 flex items-center justify-center border border-border/20 group-hover:bg-foreground group-hover:text-background transition-colors duration-500 shadow-none">
          {category.image &&
          (category.image.startsWith('http') ||
            category.image.startsWith('/')) ? (
            <img
              src={category.image}
              alt=""
              className="w-7 h-7 object-contain p-0.5"
            />
          ) : (
            <Folder className="h-5 w-5 fill-current opacity-40 shrink-0" />
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 pt-1">
          <div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground/50 leading-none">
            Cấp độ {category.level}
          </div>
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-full transition-all duration-500',
              status === PRODUCT_STATUS.PUBLISHED
                ? 'bg-emerald-500'
                : 'bg-muted-foreground/30',
            )}
          />
        </div>
      </div>

      {/* Title & Info */}
      <div className="flex-1">
        <h4 className="font-semibold text-lg text-foreground leading-tight line-clamp-2 mb-2 group-hover:translate-x-1 transition-transform duration-500">
          {category.name}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground/40 font-mono tracking-tight uppercase">
            /{category.slug}
          </span>
          {status !== PRODUCT_STATUS.PUBLISHED && (
            <span className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground/50 bg-muted/20 px-1.5 py-0.5 rounded-md">
              Ẩn hồ sơ
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-4 border-t border-border/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-foreground/40">
          Khám phá lưu trữ <ArrowRight className="h-3 w-3" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md border border-border/10 hover:bg-foreground hover:text-background transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onView(category);
          }}
        >
          <EyeIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Subtle border accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
