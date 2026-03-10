'use client';

import React from 'react';
import { Archive } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-zinc-950/50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tồn kho</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Kiểm soát số lượng và tình trạng giữ chỗ (Reserved)
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Trang đang xây dựng</h2>
          <p className="text-muted-foreground">
            Bảng quản lý Tồn kho sẽ xuất hiện tại đây.
          </p>
        </div>
      </div>
    </div>
  );
}
