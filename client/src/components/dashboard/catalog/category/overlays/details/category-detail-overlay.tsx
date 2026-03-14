'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, PRODUCT_STATUS } from '@atomecom/shared';
import {
  X,
  Package,
  Info,
  Pencil,
  Trash2,
  FolderTree,
  Type,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CategoryForm } from '../form/category-form';
import { CategoryStudioPreview } from './category-studio-preview';
import { StudioOverlay } from '@/components/dashboard/studio/studio-overlay';

interface CategoryDetailOverlayProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any, onSuccess: () => void) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

export function CategoryDetailOverlay({
  category,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isUpdating,
}: CategoryDetailOverlayProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  if (!category) return null;

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const leftContent = (
    <CategoryStudioPreview
      category={category}
      isEditing={isEditing}
    />
  );

  const rightContent = (
    <AnimatePresence mode="wait">
      {isEditing ? (
        <motion.div
          key="edit-form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6 md:p-8 lg:p-10 flex flex-col flex-1"
        >
          <CategoryForm
            category={category}
            isLoading={isUpdating}
            onSubmit={(data: any) =>
              onUpdate(
                category.id,
                { ...data, version: category.version },
                () => setIsEditing(false),
              )
            }
          />
        </motion.div>
      ) : (
        <motion.div
          key="detail-view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6 md:p-8 lg:p-10 flex flex-col space-y-10"
        >
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary opacity-60">
                <Type className="h-4 w-4" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">
                  Thông tin định danh
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 rounded-none border-border/40 font-black uppercase tracking-widest text-[9px] gap-2 px-4 hover:bg-foreground hover:text-background transition-all"
              >
                <Pencil className="h-3 w-3" />
                Chỉnh sửa
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                  Tên danh mục
                </label>
                <p className="text-xl font-bold mt-1 uppercase tracking-tighter">
                  {category.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                    Đường dẫn (Slug)
                  </label>
                  <p className="text-sm font-mono mt-1 text-muted-foreground">
                    /{category.slug}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-none text-[9px] font-black uppercase tracking-[0.15em] border',
                        category.status === PRODUCT_STATUS.PUBLISHED
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-muted/10 text-muted-foreground border-border/20',
                      )}
                    >
                      {category.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-primary opacity-60">
              <ImageIcon className="h-4 w-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">
                Hình ảnh & Mô tả
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                  Mô tả danh mục
                </label>
                <p className="text-sm text-foreground/70 mt-1 leading-relaxed italic opacity-80">
                  "{category.description || 'Không có nội dung mô tả.'}"
                </p>
              </div>
              {category.image && (
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest block mb-3">
                    Ảnh đại diện
                  </label>
                  <div className="aspect-[2/1] rounded-[var(--radius)] border border-border/20 overflow-hidden bg-muted/10 max-w-md shadow-2xl">
                    <img
                      src={category.image}
                      className="w-full h-full object-cover"
                      alt="Category Hero"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="pt-10 border-t border-border/20 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-muted-foreground/30 tracking-widest">
                Metadata Sync
              </span>
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase">
                Nodes: 124 Linked
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category.id)}
              className="h-9 px-4 rounded-none border-danger-soft/20 text-danger-soft hover:bg-danger-soft hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Gỡ bỏ danh mục
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <StudioOverlay
      isOpen={isOpen}
      onClose={handleClose}
      leftContent={leftContent}
      rightContent={rightContent}
      maxWidth="max-w-6xl"
      showBackButton={isEditing}
      onBack={() => setIsEditing(false)}
    />
  );
}





