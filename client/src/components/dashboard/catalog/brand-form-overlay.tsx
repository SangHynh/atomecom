'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Globe, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BrandForm } from './brand-form';
import { BrandStudioPreview } from './brand-studio-preview';
import { StudioOverlay } from '../studio-overlay';
import { cn } from '@/lib/utils';
import { Brand } from '@atomecom/shared';

interface BrandFormOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Brand;
  isLoading?: boolean;
}

export function BrandFormOverlay({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: BrandFormOverlayProps) {
  const { t } = useTranslation();
  const [logo, setLogo] = useState<string | undefined>(initialData?.logo);

  // Sync logo when initialData changes
  useEffect(() => {
    setLogo(initialData?.logo);
  }, [initialData]);

  const leftContent = (
    <BrandStudioPreview
      brand={logo ? ({ ...initialData, logo } as Brand) : initialData}
      isEditing={true}
      onLogoChange={setLogo}
    />
  );

  const rightContent = (
    <div className="p-8 md:p-16 lg:p-20 relative">
      <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              {initialData
                ? t('catalog.brands.actions.edit', {
                    defaultValue: 'Cấu hình Thương hiệu',
                  })
                : t('catalog.brands.actions.create', {
                    defaultValue: 'Khởi tạo Thương hiệu',
                  })}
            </h1>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            {t('catalog.brands.management_context', {
              defaultValue: 'Quản lý bản sắc & nhận diện',
            })}
          </p>
        </div>
      </header>

      <div className="max-w-4xl">
        <BrandForm
          initialData={initialData}
          isLoading={isLoading}
          logo={logo}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );

  return (
    <StudioOverlay
      isOpen={isOpen}
      onClose={onClose}
      leftContent={leftContent}
      rightContent={rightContent}
      maxWidth="max-w-7xl"
    />
  );
}
