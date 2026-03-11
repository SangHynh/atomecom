import React from 'react';
import { Product } from '@atomecom/shared';
import { DetailSection, SECTION_ICON } from './shared';

interface DetailsSectionProps {
  product: Product;
}

export function DetailsSection({ product }: DetailsSectionProps) {
  return (
    <DetailSection icon={SECTION_ICON.details} title="Mô tả chi tiết">
      <div className="prose prose-sm max-w-none text-foreground/70 leading-relaxed">
        {product.description || 'Không có nội dung mô tả chi tiết.'}
      </div>
      {product.images && product.images.length > 0 && (
        <div className="mt-8">
          <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest block mb-4">
            Thư viện hình ảnh
          </label>
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((img, idx) => (
              <div
                key={idx}
                className="aspect-[4/3] rounded border border-border/20 overflow-hidden bg-muted/10"
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt="Gallery"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </DetailSection>
  );
}
