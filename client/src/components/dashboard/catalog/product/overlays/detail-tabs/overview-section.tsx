import React from 'react';
import { Product, PRODUCT_STATUS } from '@atomecom/shared';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DetailSection, SECTION_ICON } from './shared';

interface OverviewSectionProps {
  product: Product;
}

export function OverviewSection({ product }: OverviewSectionProps) {
  return (
    <DetailSection icon={SECTION_ICON.basic} title="Thông tin cơ bản">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
              Tên sản phẩm
            </label>
            <p className="text-xl font-bold mt-1">{product.name}</p>
          </div>
          <div className="flex flex-wrap gap-10">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                Thương hiệu
              </label>
              <p className="text-sm font-medium mt-1">Chưa xác định</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                Danh mục
              </label>
              <p className="text-sm font-medium mt-1">Mặc định</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                Trạng thái
              </label>
              <div className="mt-1">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                    product.status === PRODUCT_STATUS.PUBLISHED
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-zinc-50 text-zinc-500 border border-zinc-100',
                  )}
                >
                  {product.status}
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
              Mô tả ngắn
            </label>
            <p className="text-sm text-foreground/70 mt-1 leading-relaxed italic">
              {product.shortDescription || 'Không có mô tả ngắn.'}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest block">
            Ảnh đại diện
          </label>
          <div className="aspect-square rounded-md border border-border/20 overflow-hidden bg-muted/30">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground/20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </DetailSection>
  );
}
