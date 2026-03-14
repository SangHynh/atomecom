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

import { useTableParams } from '@/hooks/use-table-params';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  [PRODUCT_STATUS.PUBLISHED]: {
    label: 'Đang hiển thị',
    className: 'bg-success/10 text-success border-success/20',
  },
  [PRODUCT_STATUS.DRAFT]: {
    label: 'Bản nháp',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  [PRODUCT_STATUS.HIDDEN]: {
    label: 'Đã ẩn',
    className: 'bg-muted/10 text-muted-foreground border-border/20',
  },
  [PRODUCT_STATUS.DISCONTINUED]: {
    label: 'Ngừng bán',
    className: 'bg-danger-soft/10 text-danger-soft border-danger-soft/20',
  },
};

export function ProductTable({
  products,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const { params, setParams } = useTableParams();
  const sortField = params.sortField || 'name';
  const sortOrder = params.sortOrder as 'asc' | 'desc' | undefined || 'asc';

  const handleSort = (field: string) => {
    if (params.sortField === field) {
      setParams({
        sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setParams({ sortField: field, sortOrder: 'asc' });
    }
  };
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
          onSort={handleSort}
        />
        <SortableHeader
          label="Phân loại"
          field="categoryId"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={handleSort}
        />
        <SortableHeader
          label="Trạng thái"
          field="status"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={handleSort}
        />
        <SortableHeader
          label="Đánh giá"
          field="avgRating"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={handleSort}
        />
        <SortableHeader
          label="Cập nhật"
          field="updatedAt"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={handleSort}
        />
        <div className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/30 text-right pr-10">
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
              className="grid grid-cols-[3fr_1.5fr_1fr_0.8fr_1fr_auto] items-center px-2 py-5 hover:bg-foreground/5 transition-all cursor-pointer group border-b border-border/5"
            >
              {/* Product Info */}
              <div className="flex items-center gap-5 min-w-0 px-4">
                <div className="h-14 w-14 rounded-[var(--radius)] overflow-hidden bg-muted/20 border border-border/20 shrink-0 flex items-center justify-center transition-all group-hover:border-foreground/20 shadow-none">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground/20" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-[15px] leading-snug truncate text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                    {product.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground/40 font-mono mt-1.5 truncate tracking-tighter uppercase font-bold">
                    {product.slug}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="min-w-0 group/cat px-4">
                <p className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.15em] truncate group-hover/cat:text-foreground transition-colors">
                  {product.categoryId?.slice(-8) || '—'}
                </p>
              </div>

              {/* Status */}
              <div className="px-4">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.15em] border rounded-none transition-all shadow-none',
                    status.className,
                  )}
                >
                  {status.label}
                </span>
              </div>

              {/* Rating */}
              <div className="px-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-black tabular-nums text-foreground/80 leading-none tracking-tighter">
                    {product.avgRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-[9px] text-muted-foreground/20 font-black font-mono">
                    / 5.0
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="px-4">
                <p className="text-[10px] text-muted-foreground/20 font-black uppercase tracking-[0.1em] font-mono">
                  {new Date(product.updatedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                  <span className="opacity-30">.26</span>
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
                      className="h-10 w-10 border border-border/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-foreground hover:text-background rounded-[var(--radius)] shadow-none"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-none border-border/40 shadow-2xl p-2 bg-background/95 backdrop-blur-md"
                  >
                    <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 px-3 py-2">
                      Điều khiển nội dung
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => onView(product)}
                      className="text-[10px] font-black uppercase tracking-[0.1em] rounded-none focus:bg-foreground focus:text-background py-3 px-3 gap-3 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit(product)}
                      className="text-[10px] font-black uppercase tracking-[0.1em] rounded-none focus:bg-foreground focus:text-background py-3 px-3 gap-3 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Hiệu chỉnh dữ liệu
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/10 my-2" />
                    <DropdownMenuItem
                      onClick={() => onDelete(product.id)}
                      className="text-[10px] font-black uppercase tracking-[0.1em] rounded-none text-danger-soft focus:text-white focus:bg-danger-soft py-3 px-3 gap-3 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Gỡ bỏ sản phẩm
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





