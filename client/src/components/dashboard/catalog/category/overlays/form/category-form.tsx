'use client';

import React from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CategorySchema,
  Category,
  PRODUCT_STATUS,
} from '@atomecom/shared';
import { useCategoryForm } from '@/hooks/use-category-form';
import {
  Form,
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
import { Tag, Plus } from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import { useCategories } from '@/hooks/use-categories';
import { handleBackendValidationError } from '@/lib/form-utils';
import { StudioFormHeader } from '@/components/dashboard/studio/studio-form-header';
import { StudioFormFooter } from '@/components/dashboard/studio/studio-form-footer';
import { StudioField } from '@/components/dashboard/studio/studio-field';
import { StudioInput } from '@/components/dashboard/studio/studio-input';
import { StudioSelect } from '@/components/dashboard/studio/studio-select';
import { StudioTextarea } from '@/components/dashboard/studio/studio-textarea';

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
  const { form, handleActualSubmit } = useCategoryForm({ category, onSubmit });

  const steps = [{ id: 'general', title: 'Thông tin chung', icon: Tag }];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleActualSubmit)}
        className="flex flex-col h-full bg-background mt-4"
      >
        <StudioFormHeader
          steps={steps}
          currentStep={0}
        />

        <div className="flex-1 overflow-visible px-8 py-10">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Row 1: Primary Identity */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <StudioField
                      label="Tên gọi định danh phân loại"
                      required
                    >
                      <StudioInput
                        {...field}
                        placeholder="Ví dụ: Đồ gia dụng, Smartphone..."
                        className="h-14 text-2xl font-black border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/10 shadow-none uppercase tracking-tighter"
                      />
                    </StudioField>
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold mt-2 uppercase tracking-wide text-danger-soft" />
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
                    <FormControl>
                      <StudioField label="Đường dẫn SEO (Slug)" required>
                        <StudioInput
                          {...field}
                          mono
                          className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all font-black text-sm shadow-none"
                        />
                      </StudioField>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StudioSelect
                        label="Phân cấp cha"
                        onValueChange={field.onChange}
                        value={field.value || 'root'}
                      >
                        <SelectTrigger className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none px-0 font-black uppercase tracking-[0.15em] text-[10px] shadow-none hover:border-foreground transition-all text-foreground/80">
                          <SelectValue placeholder="Chọn danh mục cha" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-border/40 shadow-2xl bg-background/95 backdrop-blur-xl">
                          <SelectItem
                            value="root"
                            className="text-[10px] font-black uppercase py-3.5 px-4 tracking-[0.1em] focus:bg-foreground focus:text-background transition-colors rounded-none italic opacity-50"
                          >
                            -- Danh mục gốc --
                          </SelectItem>
                          {categories
                            ?.filter((c) => c.id !== category?.id)
                            .map((c) => (
                              <SelectItem
                                key={c.id}
                                value={c.id}
                                className="text-[10px] font-black uppercase py-3.5 px-4 tracking-[0.1em] focus:bg-foreground focus:text-background transition-colors rounded-none"
                              >
                                {c.name}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StudioSelect
                        label="Trạng thái hiển thị"
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

            {/* Row 3: Visual & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
              <div className="md:col-span-3 space-y-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <StudioField label="Ảnh đại diện (Hero)">
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

              <div className="md:col-span-9">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <StudioField label="Mô tả đặc điểm phân loại">
                          <StudioTextarea
                            {...field}
                            rows={6}
                            placeholder="Ghi chú về mục đích, đối tượng khách hàng hoặc đặc tính riêng của danh mục này..."
                            className="border border-border/40 rounded-[var(--radius)] bg-muted/5 p-4 text-sm leading-relaxed resize-none shadow-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all font-normal h-[160px]"
                          />
                        </StudioField>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <StudioFormFooter
          currentStep={0}
          totalSteps={1}
          canGoBack={false}
          onPrev={() => {}}
          isSubmitStep={true}
          isLoading={isLoading}
          submitLabel={category ? 'Cập nhật danh mục' : 'Phát hành danh mục'}
        />
      </form>
    </Form>
  );
}





