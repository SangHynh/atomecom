'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Category, PRODUCT_STATUS } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import { Folder, Eye as EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
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
        'group relative flex flex-col p-5 rounded-[28px] border border-border/40 bg-background/50 hover:bg-background hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer',
        draggedId === category.id &&
          'opacity-50 scale-95 border-primary/50 border-dashed',
        draggedId &&
          draggedId !== category.id &&
          dragOverPath === category.path &&
          'bg-primary/5 border-primary ring-2 ring-primary ring-offset-2 scale-105 z-10',
      )}
      onClick={() => onNavigate(category.path)}
    >
      {/* Background Pattern / Image */}
      {category.icon &&
      (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500 scale-105 group-hover:scale-100"
          style={{ backgroundImage: `url(${category.icon})` }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute -top-6 -right-6 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-500 group-hover:scale-110">
          <Folder className="h-36 w-36 -rotate-12" />
        </div>
      )}

      {/* Header Section: Icon (Left) & Status/Level (Right) */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="relative group/icon">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 text-primary shadow-sm border border-border/40 group-hover/icon:bg-primary group-hover/icon:text-white transition-all duration-500 relative overflow-hidden">
            {category.icon &&
            (category.icon.startsWith('http') ||
              category.icon.startsWith('/')) ? (
              <img
                src={category.icon}
                alt=""
                className="w-5 h-5 object-cover"
              />
            ) : (
              <Folder className="h-5 w-5 fill-current opacity-70" />
            )}
          </div>
        </div>

        {/* Status & Level Area (Right) */}
        <div className="flex flex-col items-end gap-1.5 pt-1 relative">
          <Badge
            variant="outline"
            className="text-[9px] font-black uppercase tracking-tighter border-primary/20 text-primary bg-primary/5 leading-none py-1.5 px-2.5 rounded-full z-10"
          >
            Lvl {category.level}
          </Badge>

          {/* Slanted Status Seal - "Dấu Mộc" Style (No background, high visibility stamp) */}
          <div className="absolute top-9 -right-2 z-30 pointer-events-none rotate-[-15deg] whitespace-nowrap">
            <div
              className={cn(
                'text-[10px] font-black uppercase tracking-[0.2em] py-1 px-2.5 transition-all duration-500',
                'border-2 rounded-md backdrop-blur-[1px]',
                (category as any).status === PRODUCT_STATUS.PUBLISHED &&
                  'text-primary/80 border-primary/40 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]',
                (category as any).status === PRODUCT_STATUS.DRAFT &&
                  'text-zinc-500/80 border-zinc-500/40',
                (category as any).status === PRODUCT_STATUS.HIDDEN &&
                  'text-amber-500/80 border-amber-500/40',
                (category as any).status === PRODUCT_STATUS.DISCONTINUED &&
                  'text-rose-500/80 border-rose-500/40',
                !(category as any).status &&
                  'text-primary/80 border-primary/40',
              )}
            >
              {(category as any).status || PRODUCT_STATUS.PUBLISHED}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1 relative z-10 flex-1">
        <h4 className="font-black text-sm uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
          {category.name}
        </h4>
        <p className="text-[10px] text-muted-foreground/60 font-medium line-clamp-1 mb-3">
          {category.slug}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-dashed border-border/40 flex items-center justify-between relative z-10">
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
          Chi tiết
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border-border bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-white hover:border-primary transition-all transform translate-x-1 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onView(category);
          }}
        >
          <EyeIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
