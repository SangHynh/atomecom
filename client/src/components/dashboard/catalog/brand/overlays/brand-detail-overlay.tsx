'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Globe,
  Package,
  Calendar,
  Info,
  ArrowUpRight,
  Edit,
  Trash2,
  AlertTriangle,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Brand, PRODUCT_STATUS } from '@atomecom/shared';
import { BrandForm } from '../form/brand-form';
import { BrandStudioPreview } from '../views/brand-studio-preview';
import { StudioOverlay } from '@/components/dashboard/studio/studio-overlay';

interface BrandDetailOverlayProps {
  brand: Brand | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any, onSuccess: () => void) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

export function BrandDetailOverlay({
  brand,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isUpdating,
}: BrandDetailOverlayProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [logo, setLogo] = useState<string | undefined>(brand?.logo);

  // Sync logo when brand changes
  useEffect(() => {
    if (brand?.logo) {
      setLogo(brand.logo);
    }
  }, [brand]);

  if (!brand) return null;

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const leftContent = (
    <BrandStudioPreview
      brand={logo ? ({ ...brand, logo } as Brand) : brand}
      isEditing={isEditing}
      onLogoChange={setLogo}
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
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-sm text-primary">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight">
                {t('catalog.brands.detail.edit_title', {
                  defaultValue: 'Cập nhật Thương hiệu',
                })}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mt-0.5">
                {t('catalog.brands.detail.edit_subtitle', {
                  defaultValue: 'Cấu hình chuyên sâu cho',
                })}{' '}
                {brand.name}
              </p>
            </div>
          </div>

          <div className="bg-muted/5 border-[0.5px] border-border/40 p-4 rounded-sm mb-4">
            <BrandForm
              initialData={logo ? ({ ...brand, logo } as Brand) : brand}
              isLoading={isUpdating}
              onSubmit={(data: any) =>
                onUpdate(brand.id, data, () => setIsEditing(false))
              }
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="detail-view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6 md:p-8 lg:p-10 flex flex-col space-y-8"
        >
          {/* Brand Overview & Stats Header */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 opacity-30">
                  <Info className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    {t('catalog.brands.detail.overview', {
                      defaultValue: 'Overview',
                    })}
                  </span>
                </div>
                <p className="text-base md:text-lg font-medium leading-snug text-foreground/80 italic">
                  "{brand.description || 'Thương hiệu đối tác chiến lược.'}"
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                {[
                  {
                    icon: Package,
                    label: 'Products',
                    value: '450+',
                    color: 'text-primary',
                  },
                  {
                    icon: Calendar,
                    label: 'Since',
                    value: format(new Date(brand.createdAt), 'MMM yyyy'),
                    color: 'text-primary',
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-muted/10 border border-border/10 px-3 py-2 rounded-md min-w-[100px]"
                  >
                    <div className="flex items-center gap-2 mb-1 opacity-40">
                      <stat.icon className={`h-3 w-3 ${stat.color}`} />
                      <span className="text-[8px] font-bold uppercase tracking-widest leading-none">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-sm font-bold leading-none">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Management & Highlights row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <section className="lg:col-span-3 bg-muted/5 border-[0.5px] border-border/40 rounded-sm p-5 relative overflow-hidden flex items-center justify-between">
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Edit className="h-3 w-3 text-primary" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-primary">
                    Management
                  </span>
                </div>
                <h3 className="text-sm font-bold uppercase mb-1">
                  Cập nhật thông tin
                </h3>
                <p className="text-[11px] text-muted-foreground opacity-70 max-w-[240px]">
                  Thay đổi cơ bản cho {brand.name}.
                </p>
              </div>
              <Button
                onClick={() => setIsEditing(true)}
                className="relative z-10 bg-primary hover:bg-primary/90 text-white rounded-md px-4 h-9 shadow-none font-bold uppercase tracking-wide text-[9px]"
              >
                {t('common.edit', { defaultValue: 'Edit' })}
              </Button>
            </section>

            <section className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3 opacity-30">
                <Package className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  Highlights
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['High Quality', 'Eco', 'Global', 'Best Seller'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-md bg-background border border-border/10 text-[9px] font-bold uppercase tracking-tight"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Danger Zone */}
          <section className="pt-6 border-t border-border/40">
            <div className="bg-rose-500/5 border-[0.5px] border-rose-500/20 rounded-sm p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-sm bg-rose-500/10 text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-rose-600">
                    Xóa thương hiệu
                  </h4>
                  <p className="text-[10px] text-muted-foreground italic">
                    Vĩnh viễn và không hoàn tác.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  handleClose();
                  onDelete(brand.id);
                }}
                className="border-rose-500/20 text-rose-600 hover:bg-rose-500 hover:text-white rounded-sm px-4 h-8 text-[9px] font-bold uppercase tracking-widest"
              >
                Xóa ngay
              </Button>
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
      showBackButton={isEditing}
      onBack={() => setIsEditing(false)}
      maxWidth="max-w-6xl"
    />
  );
}
