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
import { StudioField } from '@/components/dashboard/studio/studio-field';
import { StudioInput } from '@/components/dashboard/studio/studio-input';
import { StudioSelect } from '@/components/dashboard/studio/studio-select';
import { StudioTextarea } from '@/components/dashboard/studio/studio-textarea';
import { generateSlug } from '@/lib/utils';

interface BasicsStepProps {
  form: UseFormReturn<ProductFormSchema>;
  initialData?: any;
  brands: any[];
  categories: any[];
}

export function BasicsStep({ form, initialData, brands, categories }: BasicsStepProps) {
  const watchName = form.watch('name');

  React.useEffect(() => {
    if (!initialData && watchName) {
      form.setValue('slug', generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, initialData, form]);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Essential Identification */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <StudioField
                label="Tên gọi định danh sản phẩm"
                required
              >
                <StudioInput
                  {...field}
                  placeholder="Ví dụ: iPhone 15 Pro Max 256GB..."
                  className="h-14 text-2xl font-black border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/10 shadow-none uppercase tracking-tighter"
                />
              </StudioField>
            </FormControl>
            <FormMessage className="text-[9px] font-bold mt-2 uppercase tracking-wide text-danger-soft" />
          </FormItem>
        )}
      />

      {/* Classification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StudioSelect
                  label="Danh mục ngành hàng"
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none px-0 font-black uppercase tracking-[0.15em] text-[10px] shadow-none hover:border-foreground transition-all text-foreground/80">
                    <SelectValue placeholder="Chọn phân loại..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border/40 shadow-2xl bg-background/95 backdrop-blur-xl">
                    {categories?.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="text-[10px] font-black uppercase py-3.5 px-4 tracking-[0.1em] focus:bg-foreground focus:text-background transition-colors rounded-none"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </StudioSelect>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StudioSelect
                  label="Thương hiệu đối tác"
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none px-0 font-black uppercase tracking-[0.15em] text-[10px] shadow-none hover:border-foreground transition-all text-foreground/80">
                    <SelectValue placeholder="Chọn nhãn hàng..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border/40 shadow-2xl bg-background/95 backdrop-blur-xl">
                    {brands?.map((brand) => (
                      <SelectItem
                        key={brand.id}
                        value={brand.id}
                        className="text-[10px] font-black uppercase py-3.5 px-4 tracking-[0.1em] focus:bg-foreground focus:text-background transition-colors rounded-none"
                      >
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </StudioSelect>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Logic & Categorization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StudioField label="Đường dẫn SEO (Slug)" required>
                  <StudioInput
                    {...field}
                    mono
                    className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all font-black text-sm shadow-none"
                  />
                </StudioField>
              </FormControl>
              <FormMessage />
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
                    {Object.values(PRODUCT_STATUS).map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="text-[10px] font-black uppercase py-3.5 px-4 tracking-[0.1em] focus:bg-foreground focus:text-background transition-colors rounded-none"
                      >
                        {status.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </StudioSelect>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Descriptive Narratives */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <StudioField label="Thông tin mô tả & Đặc điểm nổi bật">
                <StudioTextarea
                  {...field}
                  rows={8}
                  placeholder="Nêu bật những đặc tính kỹ thuật, trải nghiệm người dùng hoặc giá trị cốt lõi của sản phẩm..."
                  className="border border-border/40 rounded-[var(--radius)] bg-muted/5 p-4 text-sm leading-relaxed resize-none shadow-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all font-normal h-[180px]"
                />
              </StudioField>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}





