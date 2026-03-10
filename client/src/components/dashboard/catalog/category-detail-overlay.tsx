'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, PRODUCT_STATUS } from '@atomecom/shared';
import {
  X,
  Globe,
  Package,
  Info,
  Edit,
  Trash2,
  AlertTriangle,
  FolderTree,
  Tags,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/lib/category-icons';
import { cn } from '@/lib/utils';

import { CategoryStudioPreview } from './category-studio-preview';
import { StudioOverlay } from '../studio-overlay';
import { CategoryForm } from './category-form';

interface CategoryDetailOverlayProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any, onSuccess: () => void) => void;
  onDelete: (id: string) => void;
  onEdit?: (category: Category) => void;
  isUpdating?: boolean;
}

export function CategoryDetailOverlay({
  category,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onEdit,
  isUpdating,
}: CategoryDetailOverlayProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = React.useState(false);

  if (!category) return null;

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const leftContent = (
    <CategoryStudioPreview category={category} isEditing={isEditing} />
  );

  const rightContent = (
    <AnimatePresence mode="wait">
      {isEditing ? (
        <motion.div
          key="edit-form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-8 md:p-12 lg:p-16 flex flex-col flex-1"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {t('catalog.categories.detail.edit_title', {
                  defaultValue: 'Cập nhật Danh mục',
                })}
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60 mt-1">
                {t('catalog.categories.detail.edit_subtitle', {
                  defaultValue: 'Chỉnh sửa thông tin của',
                })}{' '}
                {category.name}
              </p>
            </div>
          </div>

          <div className="bg-muted/10 border border-border/40 p-8 rounded-[40px] shadow-inner mb-6">
            <CategoryForm
              initialData={category}
              isLoading={isUpdating}
              onSubmit={(data) =>
                onUpdate(
                  category.id,
                  { ...data, version: category.version },
                  () => setIsEditing(false),
                )
              }
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl h-11"
          >
            {t('common.cancel_back', { defaultValue: 'Hủy bỏ và quay lại' })}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="detail-view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-8 md:p-12 lg:p-16 flex flex-col space-y-12"
        >
          <section>
            <div className="flex items-center gap-2 mb-6 opacity-30">
              <Info className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {t('catalog.categories.detail.overview', {
                  defaultValue: 'Tổng quan',
                })}
              </span>
            </div>
            <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground/80 italic">
              "
              {category.description ||
                t('catalog.categories.detail.no_description', {
                  defaultValue:
                    'Danh mục này đóng vai trò quan trọng trong việc phân loại sản phẩm.',
                })}
              "
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted/30 border border-border/40 p-6 rounded-[32px]">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Sản phẩm
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight">124</p>
            </div>
            <div className="bg-muted/30 border border-border/40 p-6 rounded-[32px]">
              <div className="flex items-center gap-3 mb-2">
                <Tags className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Thuộc tính
                </span>
              </div>
              <p className="text-2xl font-black tracking-tight">
                {category.attributeDefinitions?.length || 0}
              </p>
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 relative overflow-hidden group/manage">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/manage:opacity-20 transition-opacity">
              <FolderTree className="h-24 w-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Edit className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  {t('common.admin', { defaultValue: 'Quản trị viên' })}
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                {t('catalog.categories.detail.setup_title', {
                  defaultValue: 'Thiết lập danh mục',
                })}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                {t('catalog.categories.detail.setup_description', {
                  defaultValue:
                    'Cập nhật cấu trúc hoặc thông tin hiển thị của danh mục này.',
                })}
              </p>
              <Button
                onClick={handleStartEdit}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 h-12 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[11px] transition-all"
              >
                {t('common.edit_details', {
                  defaultValue: 'Chỉnh sửa chi tiết',
                })}
              </Button>
            </div>
          </section>

          <section className="mt-12 pt-12 border-t border-border/40">
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-[32px] p-8">
              <div className="flex items-center gap-2 mb-6 text-rose-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {t('common.danger_zone', {
                    defaultValue: 'Khu vực nguy hiểm',
                  })}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="max-w-md">
                  <h4 className="text-lg font-black uppercase tracking-tight text-rose-600 mb-1">
                    {t('catalog.categories.actions.delete_title', {
                      defaultValue: 'Xóa danh mục',
                    })}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium italic">
                    {t('catalog.categories.actions.delete_warning', {
                      defaultValue: 'Hành động này không thể hoàn tác.',
                    })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleClose();
                    onDelete(category.id);
                  }}
                  className="border-rose-500/30 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl px-6 h-11 font-black uppercase tracking-widest text-[11px] transition-all"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete_permanently', {
                    defaultValue: 'Xóa vĩnh viễn',
                  })}
                </Button>
              </div>
            </div>
          </section>
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
