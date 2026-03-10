'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-zinc-950/50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Quản lý danh sách sản phẩm và biến thể (SKU)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm sản phẩm</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Trang đang xây dựng</h2>
          <p className="text-muted-foreground">
            Các tính năng quản lý danh sách sản phẩm sẽ sớm ra mắt.
          </p>
        </div>
      </div>
    </div>
  );
}
