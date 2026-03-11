'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormSchema } from '@atomecom/shared';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Brand, Category } from '@atomecom/shared';

interface BasicsStepProps {
  form: UseFormReturn<ProductFormSchema>;
  brands: Brand[];
  categories: Category[];
}

export function BasicsStep({ form, brands, categories }: BasicsStepProps) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 fill-mode-both">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Tên gọi sản phẩm định danh
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nhập tên sản phẩm thương mại..."
                  className="h-12 text-lg font-bold border-border bg-background rounded-sm focus-visible:ring-primary/20 focus-visible:border-primary transition-all placeholder:text-muted-foreground/30"
                />
              </FormControl>
              <FormMessage className="text-[10px] font-medium mt-1.5" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Nhãn hàng / Thương hiệu
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10 border-border bg-background rounded-sm font-semibold text-xs focus:ring-primary/20 hover:border-primary transition-all">
                    <SelectValue placeholder="Chọn thương hiệu đối tác" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-sm border-border shadow-md">
                  {brands?.map((brand) => (
                    <SelectItem
                      key={brand.id}
                      value={brand.id}
                      className="text-[10px] font-bold uppercase py-2"
                    >
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Nhóm phân loại hệ thống
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10 border-border bg-background rounded-sm font-semibold text-xs focus:ring-primary/20 hover:border-primary transition-all">
                    <SelectValue placeholder="Chọn danh mục sản phẩm" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-sm border-border shadow-md">
                  {categories?.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="text-[10px] font-bold uppercase py-2"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Tóm tắt nội dung (Dùng cho danh sách)
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về đặc điểm nổi bật nhất của sản phẩm..."
                  className="border border-border bg-background rounded-sm p-4 text-xs leading-relaxed resize-none focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Mô tả chi tiết sản phẩm
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={8}
                  placeholder="Thông tin chi tiết, tính năng và công dụng..."
                  className="border border-border bg-background rounded-sm p-4 text-xs leading-relaxed resize-none focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
