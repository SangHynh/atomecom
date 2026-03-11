'use client';

import React from 'react';
import { Edit, Trash2, Globe } from 'lucide-react';
import { Brand } from '@atomecom/shared';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { SortableHeader } from '@/components/dashboard/studio/sortable-header';
import { StudioEmptyState } from '@/components/dashboard/studio/studio-empty-state';

interface BrandTableProps {
  brands: Brand[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function BrandTable({
  brands,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  isLoading,
}: BrandTableProps) {
  return (
    <div className="flex flex-col h-full bg-background relative selection:bg-primary/10">
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_250px_120px] border-b border-border/10 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <SortableHeader
          field="name"
          label="Bản sắc thương hiệu"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <SortableHeader
          field="slug"
          label="Đường dẫn SEO"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <SortableHeader label="Thao tác" className="justify-end" />
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_250px_120px] border-b border-border/20 p-6"
            >
              <div className="flex items-center gap-5">
                <Skeleton className="h-14 w-14 rounded-sm" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-40 self-center" />
              <div className="flex justify-end gap-2 self-center">
                <Skeleton className="h-9 w-9 rounded-sm" />
                <Skeleton className="h-9 w-9 rounded-sm" />
              </div>
            </div>
          ))
        ) : brands.length === 0 ? (
          <StudioEmptyState
            icon={Globe}
            title="Dữ liệu trống rỗng"
            description="Chưa có nhãn hàng đối tác nào được đăng ký trong hệ thống lưu trữ."
          />
        ) : (
          brands.map((brand) => (
            <div
              key={brand.id}
              className="grid grid-cols-[1fr_250px_120px] border-b border-border/10 hover:bg-muted/5 transition-colors group relative animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {/* Brand Identity */}
              <div className="px-6 py-6 flex items-center gap-5 min-w-0">
                <Avatar className="h-12 w-12 rounded-md border border-border/20 shadow-none bg-background group-hover:scale-105 transition-transform duration-700">
                  <AvatarImage
                    src={brand.logo}
                    alt={brand.name}
                    className="object-contain p-2"
                  />
                  <AvatarFallback className="bg-muted text-foreground font-semibold text-lg">
                    {brand.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-lg text-foreground leading-tight truncate group-hover:text-primary transition-colors duration-500">
                    {brand.name}
                  </span>
                  <div className="flex items-center gap-3 mt-1.5 opacity-30 group-hover:opacity-60 transition-opacity">
                    <span className="text-[9px] uppercase tracking-wide font-bold text-muted-foreground">
                      Khởi tạo:{' '}
                      {format(new Date(brand.createdAt), 'dd.MM.yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* URL Path */}
              <div className="px-6 py-6 flex items-center font-mono text-[11px] text-muted-foreground/30 tracking-tight">
                <span className="group-hover:text-foreground/40 transition-colors">
                  /{brand.slug}
                </span>
              </div>

              {/* Actions */}
              <div className="px-6 py-6 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-md border border-border/10 opacity-0 group-hover:opacity-100 hover:bg-foreground hover:text-background transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(brand);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-md border border-border/10 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all delay-75 shadow-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(brand.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
