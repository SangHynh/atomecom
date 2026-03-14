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
          label="Định danh hệ thống"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <div className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/20 text-right pr-6">
          Thao tác
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_250px_120px] border-b border-border/10 p-6"
            >
              <div className="flex items-center gap-6">
                <Skeleton className="h-14 w-14 rounded-[var(--radius)]" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-40 self-center" />
              <div className="flex justify-end gap-2 self-center pr-4">
                <Skeleton className="h-9 w-9 rounded-[var(--radius)]" />
              </div>
            </div>
          ))
        ) : brands.length === 0 ? (
          <StudioEmptyState
            icon={Globe}
            title="Dữ liệu vắng bóng"
            description="Chưa có nhãn hàng đối tác nào được đăng ký trong hệ thống lưu trữ của bạn."
          />
        ) : (
          brands.map((brand) => (
            <div
              key={brand.id}
              className="grid grid-cols-[1fr_250px_120px] border-b border-border/10 hover:bg-foreground/5 transition-all group relative animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {/* Brand Identity */}
              <div className="px-6 py-8 flex items-center gap-6 min-w-0">
                <Avatar className="h-12 w-12 rounded-[var(--radius)] border border-border/20 shadow-none bg-background group-hover:scale-110 transition-transform duration-700">
                  <AvatarImage
                    src={brand.logo}
                    alt={brand.name}
                    className="object-contain p-2"
                  />
                  <AvatarFallback className="bg-muted text-foreground font-black text-lg">
                    {brand.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-lg text-foreground leading-tight truncate group-hover:text-primary transition-colors duration-500 uppercase tracking-tight">
                    {brand.name}
                  </span>
                  <div className="flex items-center gap-3 mt-2 opacity-20 group-hover:opacity-60 transition-opacity">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">
                      Giao thức:{' '}
                      <span className="text-foreground">
                        {format(new Date(brand.createdAt), 'dd.MM')}
                      </span>
                      <span className="ml-0.5 opacity-40">.26</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* URL Path */}
              <div className="px-6 py-8 flex items-center font-mono text-[10px] text-muted-foreground/20 tracking-tighter uppercase font-black">
                <span className="group-hover:text-foreground/40 transition-colors">
                  /{brand.slug}
                </span>
              </div>

              {/* Actions */}
              <div className="px-6 py-8 flex items-center justify-end gap-2 pr-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 border border-border/10 opacity-0 group-hover:opacity-100 hover:bg-foreground hover:text-background transition-all rounded-[var(--radius)] shadow-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(brand);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 border border-border/10 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all delay-75 rounded-[var(--radius)] shadow-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(brand.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}





