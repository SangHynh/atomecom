'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Sparkles, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Brand, PRODUCT_STATUS } from '@atomecom/shared';
import { cn } from '@/lib/utils';

interface BrandStudioPreviewProps {
  brand?: Brand | null;
  isEditing?: boolean;
  onLogoChange?: (logo: string) => void;
}

export function BrandStudioPreview({
  brand,
  isEditing,
  onLogoChange,
}: BrandStudioPreviewProps) {
  const { t } = useTranslation();
  return (
    <div className="relative z-10 p-8 lg:p-10 w-full max-w-[380px] flex flex-col items-center sm:items-start">
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

      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'relative z-10 aspect-square w-full rounded-[var(--radius)] border-[0.5px] border-border/40 bg-white dark:bg-card shadow-none p-1.5 ring-1 ring-white/10 overflow-hidden group',
          isEditing && 'cursor-pointer',
        )}
        onClick={() =>
          isEditing && document.getElementById('logo-upload-studio')?.click()
        }
      >
        {isEditing && (
          <input
            type="file"
            id="logo-upload-studio"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onLogoChange) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  onLogoChange(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        )}
        <Avatar className="h-full w-full rounded-[var(--radius)]">
          <AvatarImage
            src={brand?.logo}
            alt={brand?.name || 'Preview'}
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-5xl">
            {brand?.name?.charAt(0).toUpperCase() || (
              <Sparkles className="h-8 w-8 text-white/50" />
            )}
          </AvatarFallback>
        </Avatar>

        {/* Upload Overlay (UI) */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-[var(--radius)] bg-white/20 backdrop-blur-md border-[0.5px] border-white/30 text-white">
              <Camera className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
              Thay đổi ảnh
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
      </motion.div>

      <div className="relative z-10 mt-8 text-center sm:text-left w-full">
        <div className="flex flex-wrap items-center gap-2 mb-3 justify-center sm:justify-start">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-[var(--radius)] border-none shadow-none',
              brand?.status === PRODUCT_STATUS.PUBLISHED &&
                'bg-primary/10 text-primary',
              brand?.status === PRODUCT_STATUS.DRAFT &&
                'bg-primary/10 text-primary',
              brand?.status === PRODUCT_STATUS.HIDDEN &&
                'bg-warning/10 text-warning',
              brand?.status === PRODUCT_STATUS.DISCONTINUED &&
                'bg-danger-soft/10 text-danger-soft',
              !brand?.status &&
                'bg-transparent text-muted-foreground/40 border border-muted-foreground/20',
            )}
          >
            {brand?.status || (isEditing ? 'Draft' : 'Preview')}
          </Badge>
          {isEditing && (
            <div className="px-3 py-1 rounded-[var(--radius)] bg-warning/10 text-warning text-[10px] font-bold uppercase tracking-wider border border-warning/20 animate-pulse">
              Edit Mode
            </div>
          )}
        </div>
        <h1 className="text-2xl md:text-2xl font-bold tracking-tight uppercase leading-tight text-foreground break-all transition-all">
          {brand?.name || 'Identify Brand'}
        </h1>

        <div className="mt-6 w-full h-px bg-gradient-to-r from-transparent via-border/30 to-transparent opacity-50" />

        <div className="mt-6 grid grid-cols-2 gap-6 w-full">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-1">
              {t('catalog.brands.preview.visibility', {
                defaultValue: 'Hiển thị',
              })}
            </p>
            <p className="text-sm font-bold uppercase text-foreground/80">
              {t('catalog.brands.preview.public', { defaultValue: 'Cửa hàng' })}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-1">
              {t('catalog.brands.preview.hierarchy', {
                defaultValue: 'Phân cấp',
              })}
            </p>
            <p className="text-sm font-bold uppercase text-foreground/80">
              {t('catalog.brands.preview.primary', { defaultValue: 'Chính' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}





