import React from 'react';
import { Sku } from '@atomecom/shared';
import { Tag } from 'lucide-react';
import { DetailSection, SECTION_ICON } from './shared';

interface InventorySectionProps {
  skus: Sku[];
}

export function InventorySection({ skus }: InventorySectionProps) {
  return (
    <DetailSection icon={SECTION_ICON.inventory} title="Phiên bản & Tồn kho">
      <div className="grid grid-cols-1 gap-2">
        {skus.length > 0 ? (
          skus.map((sku: Sku) => (
            <div
              key={sku.id}
              className="flex items-center justify-between p-4 rounded-md border border-border/40 bg-muted/10 group hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded bg-background border border-border/20 overflow-hidden shrink-0">
                  {sku.images?.[0] ? (
                    <img
                      src={sku.images[0]}
                      alt={sku.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Tag className="h-4 w-4 m-4 text-muted-foreground/20" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">{sku.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    SKU: {sku.skuCode}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(sku.price.basePrice)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center border border-dashed border-border/40 rounded-md">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Chưa có phiên bản nào được tạo
            </p>
          </div>
        )}
      </div>
    </DetailSection>
  );
}
