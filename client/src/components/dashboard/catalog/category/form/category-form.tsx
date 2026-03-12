'use client';

import React, { useState } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Category,
  categorySchema,
  PRODUCT_STATUS,
  CategorySchema,
} from '@atomecom/shared';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Plus,
  FolderTree,
  ImageIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, generateSlug } from '@/lib/utils';
import { useCategories } from '@/hooks/use-categories';
import { IdentityStep } from './steps/identity-step';
import { MediaStep } from './steps/media-step';

type CategoryFormData = CategorySchema;

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => void;
  isLoading?: boolean;
}

export function CategoryForm({
  category,
  onSubmit,
  isLoading,
}: CategoryFormProps) {
  const { categories } = useCategories({ limit: 100 });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      parentId: (category?.parentId as string) || 'root',
      image: category?.image || '',
      status: (category?.status as PRODUCT_STATUS) || PRODUCT_STATUS.PUBLISHED,
    } as DefaultValues<CategoryFormData>,
  });

  const watchName = form.watch('name');

  React.useEffect(() => {
    if (!category && watchName) {
      form.setValue('slug', generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, category, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          const formattedData: CategoryFormData = {
            ...data,
            parentId: data.parentId === 'root' ? null : data.parentId,
          };
          onSubmit(formattedData);
        })}
        className="flex flex-col h-full bg-background mt-4"
      >
        <div className="flex-1 overflow-visible px-8 py-10">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Row 1: Primary Identity */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                    Tên gọi định danh phân loại
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ví dụ: Đồ gia dụng, Smartphone..."
                      className="h-14 text-2xl font-semibold border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all placeholder:text-muted-foreground/20 shadow-none"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-medium mt-1.5" />
                </FormItem>
              )}
            />

            {/* Row 2: Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                      Đường dẫn SEO (Slug)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-10 border-b border-border/60 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all font-mono text-xs shadow-none opacity-80"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                      Phân cấp cha
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || 'root'}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-b border-border/60 bg-transparent rounded-none px-0 font-semibold text-xs shadow-none hover:border-primary transition-all">
                          <SelectValue placeholder="Chọn danh mục cha" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-sm border-border/40 shadow-none">
                        <SelectItem
                          value="root"
                          className="text-[10px] font-bold uppercase py-3 italic"
                        >
                          -- Danh mục gốc --
                        </SelectItem>
                        {categories
                          ?.filter((c) => c.id !== category?.id)
                          .map((c) => (
                            <SelectItem
                              key={c.id}
                              value={c.id}
                              className="text-xs font-semibold uppercase py-3"
                            >
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                      Trạng thái hiển thị
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-b border-border/60 bg-transparent rounded-none px-0 font-semibold text-xs uppercase tracking-wide shadow-none hover:border-primary transition-all text-foreground/90">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-sm border-border/40 shadow-none">
                        {Object.values(PRODUCT_STATUS).map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="text-[10px] font-bold uppercase py-2.5"
                          >
                            {status.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Visual & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
              <div className="md:col-span-3 space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">
                  Ảnh đại diện (Hero)
                </label>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <div className="group relative aspect-square rounded-md border border-dashed border-border/80 overflow-hidden bg-muted/5 flex items-center justify-center transition-all cursor-pointer hover:border-primary/40 shadow-none hover:bg-muted/10">
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
                              className="h-8 px-3 rounded-md border-border font-bold text-[9px] uppercase tracking-wide hover:bg-destructive hover:text-white hover:border-destructive transition-all"
                            >
                              Gỡ tài liệu
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-center px-4">
                          <div className="h-10 w-10 rounded-full border border-border/40 border-dashed flex items-center justify-center opacity-40 group-hover:scale-110 transition-transform group-hover:border-primary/40 group-hover:opacity-100">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                            Upload Image
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

              <div className="md:col-span-9">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                        Mô tả đặc điểm phân loại
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={6}
                          placeholder="Ghi chú về mục đích, đối tượng khách hàng hoặc đặc tính riêng của danh mục này..."
                          className="border border-border/80 rounded-md bg-muted/5 p-4 text-sm leading-relaxed resize-none shadow-none focus-visible:ring-0 focus-visible:border-primary/40 transition-all font-normal h-[160px]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-20 px-10 border-t border-border/60 bg-background flex items-center justify-end shrink-0">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 px-8 rounded-md bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-wide text-[11px] gap-3 shadow-md active:scale-[0.98] transition-all"
          >
            {category ? 'Cập nhật danh mục' : 'Phát hành danh mục'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
