'use client';

import React from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BrandSchema,
  Brand,
  PRODUCT_STATUS,
} from '@atomecom/shared';
import { useBrandForm } from '@/hooks/use-brand-form';
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
import { Award, Plus } from 'lucide-react';
import { StudioFormHeader } from '@/components/dashboard/studio/studio-form-header';
import { StudioFormFooter } from '@/components/dashboard/studio/studio-form-footer';
import { StudioField } from '@/components/dashboard/studio/studio-field';
import { StudioInput } from '@/components/dashboard/studio/studio-input';
import { StudioSelect } from '@/components/dashboard/studio/studio-select';
import { StudioTextarea } from '@/components/dashboard/studio/studio-textarea';
import { generateSlug } from '@/lib/utils';
import { handleBackendValidationError } from '@/lib/form-utils';

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
  const { form, handleActualSubmit } = useBrandForm({ initialData, onSubmit });

  const steps = [{ id: 'general', title: 'Thông tin chung', icon: Award }];

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
                      label="Tên gọi định danh nhãn hàng"
                      required
                    >
                      <StudioInput
                        {...field}
                        placeholder="Ví dụ: Apple, Samsung, Nike..."
                        className="h-14 text-2xl font-black border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/10 shadow-none uppercase tracking-tighter"
                      />
                    </StudioField>
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold mt-2 uppercase tracking-wide text-danger-soft" />
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StudioSelect
                        label="Trạng thái đối tác"
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
                  name="logo"
                  render={({ field }) => (
                    <StudioField label="Logo nhận diện">
                      <div className="group relative aspect-square rounded-[var(--radius)] border border-dashed border-border/40 overflow-hidden bg-muted/5 flex items-center justify-center transition-all cursor-pointer hover:border-foreground/20 shadow-none hover:bg-muted/10">
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
                              onChange={(e) => {
                                // Handled via upload logic if needed
                              }}
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
                        <StudioField label="Câu chuyện thương hiệu">
                          <StudioTextarea
                            {...field}
                            rows={6}
                            placeholder="Ghi chú về lịch sử, giá trị cốt lõi hoặc định vị của thương hiệu đối tác..."
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
          submitLabel={initialData ? 'Cập nhật nhãn hàng' : 'Phát hành nhãn hàng'}
        />
      </form>
    </Form>
  );
}





