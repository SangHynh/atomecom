'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormSchema } from '@atomecom/shared';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Search, Tag } from 'lucide-react';
import { PRODUCT_STATUS } from '@atomecom/shared';

interface AssetStepProps {
  form: UseFormReturn<ProductFormSchema>;
}

export function AssetStep({ form }: AssetStepProps) {
  return (
    <div className="space-y-16 animate-in fade-in duration-500 fill-mode-both">
      {/* Premium Asset Picker Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-foreground/90">
              Tư liệu hình ảnh (Visual Assets)
            </h3>
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wide">
            Yêu cầu: Tối thiểu 1 ảnh đại diện
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1 space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Ảnh đại diện (SQUARE)
            </label>
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <div className="group relative aspect-square rounded-sm border border-border bg-background overflow-hidden flex items-center justify-center transition-all cursor-pointer hover:border-primary/40">
                  {field.value ? (
                    <>
                      <img
                        src={field.value}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4 gap-2">
                        <p className="text-[8px] font-bold uppercase tracking-wider text-center text-muted-foreground">
                          Ảnh đại diện
                        </p>
                        <button
                          type="button"
                          onClick={() => field.onChange('')}
                          className="h-7 px-3 rounded-sm border border-border font-bold text-[8px] uppercase tracking-wide bg-background hover:bg-destructive hover:text-white hover:border-destructive transition-all shadow-sm"
                        >
                          Thay đổi
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center px-4">
                      <Plus className="h-4 w-4 text-muted-foreground/40" />
                      <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        Chọn ảnh đại diện
                      </p>
                      <Input
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <div className="md:col-span-3 space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              Thumbnail SEO & Đường dẫn
            </label>
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center">
                      <div className="h-10 px-3 flex items-center border border-r-0 border-border bg-muted/20 text-[10px] font-mono text-muted-foreground/40 rounded-l-sm">
                        /p/
                      </div>
                      <Input
                        {...field}
                        className="h-10 border-border rounded-none rounded-r-sm bg-background font-mono text-xs focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-none"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6 pt-2">
              <FormField
                control={form.control}
                name="seo.title"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Meta Title
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-10 border-border rounded-sm bg-background text-xs shadow-none focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Trạng thái phát hành
                    </label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-border bg-background rounded-sm focus:ring-primary/20 hover:border-primary transition-all text-foreground/90 uppercase text-[10px] font-bold tracking-wide">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-sm border-border shadow-md">
                        {Object.values(PRODUCT_STATUS).map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-[10px] font-bold uppercase py-2"
                          >
                            {s.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Multi-image Gallery Picker */}
        <div className="space-y-4 pt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Bộ sưu tập hình ảnh (Gallery Assets)
          </label>
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {field.value?.map((url: string, index: number) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-sm border border-border bg-background overflow-hidden"
                  >
                    <img src={url} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...field.value];
                        newImages.splice(index, 1);
                        field.onChange(newImages);
                      }}
                      className="absolute top-1 right-1 h-5 w-5 rounded-sm bg-destructive text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3 rotate-45" />
                    </button>
                  </div>
                ))}
                <div className="relative aspect-square rounded-sm border border-dashed border-border flex flex-col items-center justify-center bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer">
                  <Plus className="h-4 w-4 text-muted-foreground/40" />
                  <span className="text-[8px] font-bold uppercase text-muted-foreground/40 mt-1">
                    Thêm ảnh
                  </span>
                  <Input
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) =>
                      field.onChange([...(field.value || []), e.target.value])
                    }
                  />
                </div>
              </div>
            )}
          />
        </div>
      </section>

      <div className="h-px bg-border/10" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-foreground/90">
              Mô tả chi tiết SEO (Meta)
            </h3>
          </div>
          <FormField
            control={form.control}
            name="seo.description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Mô tả nội dung tìm kiếm trên Google (tối đa 160 ký tự)..."
                    className="border border-border bg-background rounded-sm p-4 text-xs leading-relaxed resize-none focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Tag className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-foreground/90">
              Từ khóa tìm kiếm (Keywords)
            </h3>
          </div>
          <FormField
            control={form.control}
            name="seo.keywords"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    value={field.value?.join(', ')}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.split(',').map((s) => s.trim()),
                      )
                    }
                    rows={4}
                    placeholder="Nhập các từ khóa, cách nhau bởi dấu phẩy..."
                    className="border border-border bg-background rounded-sm p-4 text-xs leading-relaxed resize-none focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-mono"
                  />
                </FormControl>
                <p className="text-[9px] text-muted-foreground/40 mt-2 font-medium">
                  * Phân cách các từ khóa bằng dấu phẩy (,)
                </p>
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  );
}
