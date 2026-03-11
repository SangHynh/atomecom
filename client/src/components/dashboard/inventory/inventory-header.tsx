'use client';

import React from 'react';
import { Layers, History, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InventoryHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-primary">
          <Layers className="h-5 w-5" />
          <h1 className="text-2xl font-bold uppercase tracking-wider leading-none">
            Quản lý tồn kho
          </h1>
        </div>
        <p className="text-xs text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Cập nhật giá bán, số lượng và theo dõi biến động SKU toàn hệ thống
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4 rounded-md border-border/60 font-bold uppercase tracking-widest text-[10px] gap-2"
        >
          <History className="h-3.5 w-3.5" /> Lịch sử nhập kho
        </Button>
        <Button
          size="sm"
          className="h-10 px-5 rounded-md bg-foreground text-background font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Đồng bộ kho
        </Button>
      </div>
    </div>
  );
}
