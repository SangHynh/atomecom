'use client';

import React from 'react';
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Product, PRODUCT_STATUS } from '@atomecom/shared';
import { cn } from '@/lib/utils';
import { SortableHeader } from '@/components/dashboard/studio/sortable-header';
import { StudioEmptyState } from '@/components/dashboard/studio/studio-empty-state';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  [PRODUCT_STATUS.PUBLISHED]: {
    label: 'Đang hiển thị',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  [PRODUCT_STATUS.DRAFT]: {
    label: 'Bản nháp',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  [PRODUCT_STATUS.HIDDEN]: {
    label: 'Đã ẩn',
    className: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  },
  [PRODUCT_STATUS.DISCONTINUED]: {
    label: 'Ngừng bán',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
};

export function ProductTable({
  products,
  isLoading,
  sortField,
  sortOrder,
  onSort,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (!isLoading && products.length === 0) {
    return (
      <StudioEmptyState
        icon={Box}
        title="Kho lưu trữ trống"
        description="Bắt đầu đăng ký các sản phẩm thương mại vào hệ thống quản trị của bạn."
      />
    );
  }

  return (
    <div className="w-full">
      {/* Editorial Table Header */}
      <div className="grid grid-cols-[3fr_1.5fr_1fr_0.8fr_1fr_auto] items-center border-b border-foreground/5 sticky top-0 bg-background/90 backdrop-blur-md z-10 px-2">
        <SortableHeader
          label="Sản phẩm & Nội dung"
          field="name"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <SortableHeader
          label="Phân loại"
          field="categoryId"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <SortableHeader
          label="Trạng thái"
          field="status"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <SortableHeader
          label="Đánh giá"
          field="avgRating"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <SortableHeader
          label="Cập nhật"
          field="updatedAt"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <div className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30 text-right">
          Thao tác
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/5">
        {products.map((product) => {
          const status = STATUS_MAP[product.status] || STATUS_MAP.draft;
          return (
            <div
              key={product.id}
              onClick={() => onView(product)}
              className="grid grid-cols-[3fr_1.5fr_1fr_0.8fr_1fr_auto] items-center px-2 py-4 hover:bg-muted/5 transition-all cursor-pointer group border-b border-border/5"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 min-w-0 px-4">
                <div className="h-14 w-14 rounded-md overflow-hidden bg-muted/20 border border-border/20 shrink-0 flex items-center justify-center transition-all group-hover:border-foreground/20 shadow-none">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground/20" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-base leading-snug truncate text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 font-mono mt-1 truncate tracking-tight">
                    {product.slug}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="min-w-0 group/cat px-4">
                <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wide truncate group-hover/cat:text-foreground transition-colors">
                  {product.categoryId?.slice(-8) || '—'}
                </p>
              </div>

              {/* Status */}
              <div className="px-4">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border rounded-md transition-all',
                    status.className,
                  )}
                >
                  {status.label}
                </span>
              </div>

              {/* Rating */}
              <div className="px-4">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold tabular-nums text-foreground/80 leading-none">
                    {product.avgRating?.toFixed(1) || '—'}
                  </span>
                  <span className="text-[10px] text-muted-foreground/20 font-medium font-mono">
                    / 5.0
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="px-4">
                <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wide font-mono">
                  {new Date(product.updatedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div
                className="flex justify-end px-4"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-md border border-border/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-foreground hover:text-background"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-md border-border/40 shadow-none p-2"
                  >
                    <DropdownMenuLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/50 p-2">
                      Quản trị nội dung
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => onView(product)}
                      className="text-[11px] font-semibold uppercase tracking-wide rounded-md focus:bg-muted/50 py-2.5 gap-3 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 opacity-40" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit(product)}
                      className="text-[11px] font-semibold uppercase tracking-wide rounded-md focus:bg-muted/50 py-2.5 gap-3 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 opacity-40" />
                      Chỉnh sửa sản phẩm
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/10 mx-2" />
                    <DropdownMenuItem
                      onClick={() => onDelete(product.id)}
                      className="text-[11px] font-semibold uppercase tracking-wide rounded-md text-rose-500 focus:text-rose-600 focus:bg-rose-500/5 py-2.5 gap-3 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa mục này
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
