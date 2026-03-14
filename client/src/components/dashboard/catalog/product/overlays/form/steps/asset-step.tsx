'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormSchema, PRODUCT_STATUS } from '@atomecom/shared';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Search, Tag } from 'lucide-react';
import { StudioField } from '@/components/dashboard/studio/studio-field';
import { StudioInput } from '@/components/dashboard/studio/studio-input';
import { StudioSelect } from '@/components/dashboard/studio/studio-select';
import { StudioTextarea } from '@/components/dashboard/studio/studio-textarea';

export function AssetStep({ form }: { form: UseFormReturn<ProductFormSchema> }) {
  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Visual Identity Section */}
      <section className="space-y-10">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-4 w-4 text-foreground/40" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
              Hệ thống tư liệu hình ảnh
            </h3>
          </div>
          <p className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-widest">
            Visual Identity Protocol
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-3">
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <StudioField label="Ảnh đại diện (Square)" required>
                  <div className="group relative aspect-square rounded-[var(--radius)] border border-dashed border-border/40 overflow-hidden bg-muted/5 flex items-center justify-center transition-all cursor-pointer hover:border-foreground/20 shadow-none hover:bg-muted/10">
                    {field.value ? (
                      <>
                        <img
                          src={field.value}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4 gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange('')}
                            className="h-8 px-3 rounded-none border-border font-bold text-[9px] uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                          >
                            Gỡ tài liệu
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center px-4">
                        <div className="h-10 w-10 rounded-full border border-border/20 border-dashed flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform group-hover:border-foreground/40 group-hover:opacity-100">
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                          Upload
                        </p>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </StudioField>
              )}
            />
          </div>

          <div className="md:col-span-9 space-y-10">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <StudioField label="Đường dẫn SEO (Slug) & Canonical" required>
                      <div className="flex items-center">
                        <div className="h-10 px-4 flex items-center border border-r-0 border-border/40 bg-muted/10 text-[10px] font-black text-muted-foreground uppercase tracking-widest rounded-none opacity-50">
                          /p/
                        </div>
                        <StudioInput
                          {...field}
                          mono
                          className="h-10 border-border/40 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none font-black text-sm"
                        />
                      </div>
                    </StudioField>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-10">
              <FormField
                control={form.control}
                name="seo.title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StudioField label="Tiêu đề hiển thị (Meta Title)">
                        <StudioInput
                          {...field}
                          placeholder="Mặc định sử dụng tên sản phẩm..."
                          className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-xs font-bold"
                        />
                      </StudioField>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StudioSelect
                        label="Trạng thái niêm yết"
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none px-0 font-black uppercase tracking-[0.15em] text-[10px] shadow-none hover:border-foreground transition-all text-foreground/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-border/40 shadow-2xl bg-background/95 backdrop-blur-xl">
                          {Object.values(PRODUCT_STATUS).map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="text-[10px] font-black uppercase py-3.5 px-4 tracking-[0.1em] focus:bg-foreground focus:text-background transition-colors rounded-none"
                            >
                              {s.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </StudioSelect>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Multi-image Gallery */}
        <div className="space-y-6 pt-10 border-t border-border/10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
            Bộ sưu tập chi tiết (Product Gallery)
          </h4>
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {(field.value || []).map((url: string, index: number) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-[var(--radius)] border border-border/20 bg-muted/5 overflow-hidden transition-all hover:border-foreground/20"
                  >
                    <img src={url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...field.value];
                        newImages.splice(index, 1);
                        field.onChange(newImages);
                      }}
                      className="absolute top-1 right-1 h-5 w-5 rounded-none bg-foreground text-background opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-danger-soft hover:text-white"
                    >
                      <Plus className="h-3 w-3 rotate-45" />
                    </button>
                  </div>
                ))}
                <div className="relative aspect-square rounded-[var(--radius)] border border-dashed border-border/20 flex flex-col items-center justify-center bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer group">
                  <div className="h-8 w-8 rounded-full border border-border/20 border-dashed flex items-center justify-center opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 mt-3">
                    Add Media
                  </span>
                  <input
                    type="file"
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

      {/* SEO & Meta Context */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-border/40">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-foreground/40" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
              Trình thu thập tìm kiếm (Meta)
            </h3>
          </div>
          <FormField
            control={form.control}
            name="seo.description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <StudioField label="Mô tả tóm tắt SEO (Meta Description)">
                    <StudioTextarea
                      {...field}
                      rows={4}
                      placeholder="Mô tả nội dung tìm kiếm trên Google (tối đa 160 ký tự)..."
                      className="border border-border/40 rounded-[var(--radius)] bg-muted/5 p-4 text-xs leading-relaxed resize-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all font-medium h-[120px]"
                    />
                  </StudioField>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Tag className="h-4 w-4 text-foreground/40" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
              Từ khóa dữ liệu (Keywords)
            </h3>
          </div>
          <FormField
            control={form.control}
            name="seo.keywords"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <StudioField label="Tags phân cấp (Commas separated)">
                    <StudioTextarea
                      value={field.value?.join(', ')}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.split(',').map((s) => s.trim()),
                        )
                      }
                      rows={4}
                      placeholder="Nhập các từ khóa, cách nhau bởi dấu phẩy..."
                      className="border border-border/40 rounded-[var(--radius)] bg-muted/5 p-4 text-xs leading-relaxed resize-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all font-mono h-[120px]"
                    />
                  </StudioField>
                </FormControl>
                <p className="text-[9px] text-muted-foreground/30 mt-3 font-bold uppercase tracking-widest">
                  * Indexing protocol activation
                </p>
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  );
}





