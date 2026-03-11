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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 lg:p-12 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/40 backdrop-blur-[24px] cursor-zoom-out"
          />

          {/* Centered Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 30 }}
            className="relative w-full h-full md:h-auto md:max-h-[85vh] max-w-2xl bg-background border-[0.5px] border-border/40 rounded-none md:rounded-md shadow-2xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                  <FolderTree className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground leading-none">
                    {isEditing ? 'Cập nhật danh mục' : 'Chi tiết danh mục'}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    ID:{' '}
                    <span className="font-mono">
                      {category.id.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-9 px-4 rounded-md border-border/60 font-bold uppercase tracking-wider text-[10px] gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Chỉnh sửa
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-9 w-9 rounded-md hover:bg-muted/10 border border-border/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isEditing ? (
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
              ) : (
                <div className="px-6 py-8 space-y-10">
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-primary opacity-60">
                      <Type className="h-4 w-4" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest">
                        Thông tin định danh
                      </h3>
                    </div>
                    <div className="pl-6.5 space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                          Tên danh mục
                        </label>
                        <p className="text-xl font-bold mt-1">
                          {category.name}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                            Đường dẫn (Slug)
                          </label>
                          <p className="text-sm font-mono mt-1 text-muted-foreground">
                            /category/{category.slug}
                          </p>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                            Trạng thái
                          </label>
                          <div className="mt-1">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                category.status === PRODUCT_STATUS.PUBLISHED
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : 'bg-zinc-50 text-zinc-500 border border-zinc-100',
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
                    <div className="pl-6.5 space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                          Mô tả danh mục
                        </label>
                        <p className="text-sm text-foreground/70 mt-1 leading-relaxed italic">
                          "{category.description || 'Không có nội dung mô tả.'}"
                        </p>
                      </div>
                      {category.image && (
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest block mb-3">
                            Ảnh đại diện
                          </label>
                          <div className="aspect-[2/1] rounded-md border border-border/20 overflow-hidden bg-muted/10 max-w-md">
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

                  <div className="pt-6 border-t border-border/30 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      Sản phẩm liên kết: 124
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(category.id)}
                      className="text-[10px] font-bold uppercase tracking-wider text-destructive/60 hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Xóa danh mục
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
