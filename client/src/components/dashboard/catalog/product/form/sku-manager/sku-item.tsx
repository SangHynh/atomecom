'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Tag, Hash, Box, Coins, Plus } from 'lucide-react';

import { ProductFormSchema } from '@atomecom/shared';

interface SkuItemProps {
  form: UseFormReturn<ProductFormSchema>;
  index: number;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export function SkuItem({ form, index, onRemove, showRemove }: SkuItemProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <FormField
        control={form.control}
        name={`skus.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] font-bold text-foreground/60 uppercase flex items-center gap-2 tracking-wide">
              <Tag className="h-2.5 w-2.5" /> Tên phiên bản
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="VD: Đen, XL..."
                className="h-10 rounded-sm bg-background border-border text-xs focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-semibold"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`skus.${index}.skuCode`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] font-bold text-foreground/60 uppercase flex items-center gap-2 tracking-wide">
              <Hash className="h-2.5 w-2.5" /> Mã SKU
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Mã định danh"
                className="h-10 rounded-sm bg-background border-border text-xs font-mono uppercase focus-visible:ring-primary/20 focus-visible:border-primary"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`skus.${index}.price.basePrice`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] font-bold text-foreground/60 uppercase flex items-center gap-2 tracking-wide">
              <Coins className="h-2.5 w-2.5" /> Giá bán (VNĐ)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="h-10 rounded-sm bg-background border-border text-xs font-semibold focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`skus.${index}.initialQuantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[10px] font-bold text-foreground/60 uppercase flex items-center gap-2 tracking-wide">
              <Box className="h-2.5 w-2.5" /> Số lượng nhập
            </FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="h-10 rounded-sm bg-background border-border text-xs font-semibold focus-visible:ring-primary/20 focus-visible:border-primary transition-all flex-1"
                />
                {showRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="h-10 w-10 shrink-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all border border-border/60 rounded-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* SKU Attributes Section */}
      <div className="md:col-span-4 space-y-4 pt-4 border-t border-border/40 mt-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Thông số biến thể (Attributes)
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const currentAttrs =
                form.getValues(`skus.${index}.attributes`) || [];
              form.setValue(`skus.${index}.attributes`, [
                ...currentAttrs,
                { key: '', value: '', label: '' },
              ]);
            }}
            className="h-6 px-2 text-[9px] font-bold uppercase tracking-tight gap-1 hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="h-2.5 w-2.5" /> Thêm thuộc tính
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(form.watch(`skus.${index}.attributes`) || []).map(
            (_, attrIndex) => (
              <div key={attrIndex} className="flex items-end gap-2 group/attr">
                <FormField
                  control={form.control}
                  name={`skus.${index}.attributes.${attrIndex}.key`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Key (e.g. color)"
                          className="h-8 text-[10px] rounded-sm bg-background/50"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`skus.${index}.attributes.${attrIndex}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Value (e.g. red)"
                          className="h-8 text-[10px] rounded-sm bg-background/50"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`skus.${index}.attributes.${attrIndex}.label`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Label (e.g. Màu sắc)"
                          className="h-8 text-[10px] rounded-sm bg-background/50"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentAttrs =
                      form.getValues(`skus.${index}.attributes`) || [];
                    const newAttrs = [...currentAttrs];
                    newAttrs.splice(attrIndex, 1);
                    form.setValue(`skus.${index}.attributes`, newAttrs);
                  }}
                  className="h-8 w-8 text-muted-foreground/20 hover:text-destructive transition-colors"
                >
                  <Plus className="h-3 w-3 rotate-45" />
                </Button>
              </div>
            ),
          )}

          {(form.watch(`skus.${index}.attributes`) || []).length === 0 && (
            <p className="text-[9px] text-muted-foreground/30 italic md:col-span-3">
              Chưa có thuộc tính nào được định nghĩa cho phiên bản này.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
