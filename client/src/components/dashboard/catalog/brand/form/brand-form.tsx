'use client';

import React, { useState } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Brand,
  brandSchema,
  PRODUCT_STATUS,
  BrandSchema,
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
import { Plus, ImageIcon, Type } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateSlug } from '@/lib/utils';
import { StudioFormHeader } from '@/components/dashboard/studio/studio-form-header';
import { StudioFormFooter } from '@/components/dashboard/studio/studio-form-footer';

type BrandFormData = BrandSchema;

interface BrandFormProps {
  initialData?: Brand;
  onSubmit: (data: BrandFormData) => void;
  isLoading?: boolean;
}

export function BrandForm({
  initialData,
  onSubmit,
  isLoading,
}: BrandFormProps) {
  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      logo: initialData?.logo || '',
      description: initialData?.description || '',
      status:
        (initialData?.status as PRODUCT_STATUS) || PRODUCT_STATUS.PUBLISHED,
    } as DefaultValues<BrandFormData>,
  });

  const watchName = form.watch('name');

  React.useEffect(() => {
    if (!initialData && watchName) {
      form.setValue('slug', generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, initialData, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full bg-background"
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
                    Tên gọi định danh nhãn hàng
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ví dụ: Apple, Samsung, Nike..."
                      className="h-14 text-2xl font-semibold border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all placeholder:text-muted-foreground/20 shadow-none"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-medium mt-1.5" />
                </FormItem>
              )}
            />

            {/* Row 2: Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                      Trạng thái đối tác
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
                  Logo nhận diện
                </label>
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <div className="group relative aspect-square rounded-md border border-dashed border-border/80 overflow-hidden bg-muted/5 flex items-center justify-center transition-all cursor-pointer hover:border-primary/40 shadow-none hover:bg-muted/10">
                      {field.value ? (
                        <>
                          <img
                            src={field.value}
                            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
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
                            Upload Logo
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
                        Câu chuyện thương hiệu
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={6}
                          placeholder="Ghi chú về lịch sử, giá trị cốt lõi hoặc định vị của thương hiệu đối tác..."
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
            {initialData ? 'Cập nhật nhãn hàng' : 'Phát hành nhãn hàng'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
