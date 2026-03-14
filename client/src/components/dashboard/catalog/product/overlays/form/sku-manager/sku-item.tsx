'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Trash2, Tag, Hash, Box, Coins, Plus } from 'lucide-react';

import { ProductFormSchema } from '@atomecom/shared';
import { StudioField } from '@/components/dashboard/studio/studio-field';
import { StudioInput } from '@/components/dashboard/studio/studio-input';

interface SkuItemProps {
  form: UseFormReturn<ProductFormSchema>;
  index: number;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export function SkuItem({ form, index, onRemove, showRemove }: SkuItemProps) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-10 gap-y-8">
        <FormField
          control={form.control}
          name={`skus.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StudioField
                  label="Tên định danh phiên bản"
                  required
                >
                  <StudioInput
                    {...field}
                    placeholder="VD: Midnight Black, XL..."
                    className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-xs font-bold"
                  />
                </StudioField>
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
              <FormControl>
                <StudioField
                  label="Mã SKU (Unique ID)"
                  required
                >
                  <StudioInput
                    {...field}
                    mono
                    placeholder="ĐH-BLK-XL"
                    className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-xs font-black uppercase"
                  />
                </StudioField>
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
              <FormControl>
                <StudioField
                  label="Giá niêm yết (VNĐ)"
                  required
                >
                  <div className="flex items-center">
                    <StudioInput
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-sm font-black text-right pr-6"
                    />
                    <span className="text-[10px] font-black text-muted-foreground/30 absolute right-0 bottom-3">₫</span>
                  </div>
                </StudioField>
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
              <FormControl>
                <div className="flex items-end gap-6">
                  <div className="flex-1">
                    <StudioField
                      label="Số lượng khởi tạo"
                      required
                    >
                      <StudioInput
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-sm font-black"
                      />
                    </StudioField>
                  </div>
                  {showRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(index)}
                      className="h-10 w-10 shrink-0 text-muted-foreground/20 hover:text-danger-soft hover:bg-danger-soft/5 transition-all rounded-none"
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
      </div>

      {/* SKU Attributes Section */}
      <div className="space-y-6 pt-10 border-t border-border/10">
        <div className="flex items-center justify-between">
          <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">
            Cấu hình thuộc tính (Dynamic Attributes)
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const currentAttrs =
                form.getValues(`skus.${index}.attributes`) || [];
              form.setValue(`skus.${index}.attributes`, [
                ...currentAttrs,
                { key: '', value: '', label: '' },
              ]);
            }}
            className="h-7 px-3 text-[9px] font-black uppercase tracking-widest gap-2 rounded-none border-border/40 hover:bg-muted/10 transition-all"
          >
            <Plus className="h-3 w-3" /> Thêm thuộc tính
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(form.watch(`skus.${index}.attributes`) || []).map(
            (_, attrIndex) => (
              <div key={attrIndex} className="relative p-6 bg-muted/5 border border-border/10 rounded-[var(--radius)] group/attr">
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name={`skus.${index}.attributes.${attrIndex}.key`}
                    render={({ field }) => (
                      <StudioField label="Key (slug)">
                        <StudioInput
                          {...field}
                          mono
                          placeholder="color"
                          className="h-8 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-[10px] uppercase font-black"
                        />
                      </StudioField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`skus.${index}.attributes.${attrIndex}.label`}
                    render={({ field }) => (
                      <StudioField label="Label">
                        <StudioInput
                          {...field}
                          placeholder="Màu sắc"
                          className="h-8 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-[10px] font-bold"
                        />
                      </StudioField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`skus.${index}.attributes.${attrIndex}.value`}
                    render={({ field }) => (
                      <StudioField label="Display Value">
                        <StudioInput
                          {...field}
                          placeholder="Red / Onyx / Midnight"
                          className="h-8 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-[10px] font-black"
                        />
                      </StudioField>
                    )}
                  />
                </div>
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
                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground/20 hover:text-danger-soft transition-all opacity-0 group-hover/attr:opacity-100"
                >
                  <Plus className="h-3 w-3 rotate-45" />
                </Button>
              </div>
            ),
          )}

          {(form.watch(`skus.${index}.attributes`) || []).length === 0 && (
            <div className="md:col-span-3 py-10 border border-dashed border-border/10 rounded-[var(--radius)] flex items-center justify-center">
              <span className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-widest">
                No custom attributes defined
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





