'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Brand, PRODUCT_STATUS } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { motion } from 'framer-motion';
import { Globe, Link as LinkIcon, Sparkles, Loader2, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const brandSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  logo: z.string().optional().or(z.literal('')),
  description: z.string().max(500, 'Description too long').optional(),
  status: z.nativeEnum(PRODUCT_STATUS).default(PRODUCT_STATUS.PUBLISHED),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormProps {
  initialData?: Brand;
  onSubmit: (data: BrandFormValues) => void;
  isLoading?: boolean;
  logo?: string;
}

export function BrandForm({
  initialData,
  onSubmit,
  isLoading,
  logo,
}: BrandFormProps) {
  const { t } = useTranslation();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      logo: initialData?.logo || '',
      description: initialData?.description || '',
      status: (initialData as any)?.status || PRODUCT_STATUS.PUBLISHED,
    },
  });

  // Sync external logo prop to form
  useEffect(() => {
    if (logo) {
      form.setValue('logo', logo);
    }
  }, [logo, form]);

  // Update slug when name changes (only if it's a new brand or slug is empty)
  const name = form.watch('name');
  useEffect(() => {
    if (!initialData && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', generatedSlug);
    }
  }, [name, form, initialData]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Bento Grid Header - Unified Studio Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          {/* Brand Name - Studio Editorial Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="md:col-span-6 relative group/name"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <div
                      className={cn(
                        'relative bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-5 rounded-xl border border-white/20 dark:border-white/5 transition-all duration-500 cursor-text',
                        'shadow-sm hover:shadow-md',
                        'focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5',
                      )}
                      onClick={() => {
                        const input =
                          document.getElementById('brand-name-input');
                        input?.focus();
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        <FormLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 transition-all duration-500 group-focus-within/name:text-primary">
                          {t('catalog.brands.fields.name_label', {
                            defaultValue: 'Tên thương hiệu',
                          })}
                        </FormLabel>
                        <Input
                          id="brand-name-input"
                          placeholder={t(
                            'catalog.brands.fields.name_placeholder',
                            { defaultValue: 'Nhập tên thương hiệu...' },
                          )}
                          {...field}
                          className="bg-transparent border-none text-xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/5 h-auto p-0 focus-visible:ring-0 shadow-none selection:bg-primary/30"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] mt-3 px-4 font-bold text-red-500/80" />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Slug - Glass Bento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="md:col-span-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-white/5 shadow-sm group/slug hover:border-primary/20 transition-all duration-500"
          >
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">
                    {t('catalog.brands.fields.slug_label', {
                      defaultValue: 'Đường dẫn định danh',
                    })}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within/slug:text-primary group-focus-within/slug:scale-110 transition-all" />
                      <Input
                        placeholder={t(
                          'catalog.brands.fields.slug_placeholder',
                          { defaultValue: 'duong-dan-thuong-hieu...' },
                        )}
                        {...field}
                        className="pl-9 rounded-xl border-white/10 bg-white/50 dark:bg-zinc-950/50 font-mono text-[10px] h-10 shadow-none focus-visible:ring-2 focus-visible:ring-primary/10 focus-visible:border-primary/40 transition-all font-bold"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-red-500/60" />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Status - Glass Bento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="md:col-span-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-4 rounded-xl border border-white/20 dark:border-white/5 shadow-sm hover:border-primary/20 transition-all duration-500"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                const availableStatuses = !!initialData
                  ? Object.values(PRODUCT_STATUS)
                  : [PRODUCT_STATUS.PUBLISHED, PRODUCT_STATUS.DRAFT];

                return (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">
                      {t('catalog.brands.fields.status_label', {
                        defaultValue: 'Trạng thái hiển thị',
                      })}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-xl border-white/10 bg-white/50 dark:bg-zinc-950/50 h-10 font-bold text-[9px] uppercase shadow-none focus:ring-2 focus:ring-primary/5 focus:border-primary/40 transition-all">
                          <SelectValue
                            placeholder={t(
                              'catalog.brands.fields.status_placeholder',
                              { defaultValue: 'Trạng thái' },
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[200] rounded-2xl border-white/10 shadow-2xl backdrop-blur-2xl bg-white/95 dark:bg-zinc-950/95">
                        {availableStatuses.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="capitalize font-black text-[11px] py-3 cursor-pointer hover:bg-primary/5 transition-colors"
                          >
                            {t(`product_status.${status.toLowerCase()}`, {
                              defaultValue: status,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold text-red-500/60" />
                  </FormItem>
                );
              }}
            />
          </motion.div>

          {/* Brand Narrative - Bento Item */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-6 bg-white/20 dark:bg-zinc-900/20 backdrop-blur-md p-5 rounded-xl border border-white/10 dark:border-white/5 group/desc hover:border-primary/10 transition-all"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 ml-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                        {t('catalog.brands.fields.description_label', {
                          defaultValue: 'Mô tả thương hiệu',
                        })}
                      </FormLabel>
                    </div>
                    <Sparkles className="h-4 w-4 text-primary/20 group-focus-within/desc:text-primary group-focus-within/desc:scale-125 transition-all duration-700" />
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'catalog.brands.fields.description_placeholder',
                        { defaultValue: 'Mô tả bản chất thương hiệu...' },
                      )}
                      {...field}
                      className="rounded-xl border-none bg-transparent h-[80px] p-0 text-[13px] shadow-none focus-visible:ring-0 resize-none font-medium leading-relaxed placeholder:text-muted-foreground/10"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-red-500/60 mt-2" />
                </FormItem>
              )}
            />
          </motion.div>
        </div>

        {/* Submit Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="pt-2"
        >
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full h-11 relative overflow-hidden group rounded-xl transition-all duration-500',
              'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.01] active:scale-[0.99]',
              'shadow-md hover:shadow-lg',
              'font-bold uppercase tracking-widest text-[10px] gap-2',
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_0_50px_rgba(139,92,246,0.3)] dark:shadow-[0_0_50px_rgba(139,92,246,0.2)]" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {initialData
                ? t('catalog.brands.actions.update', {
                    defaultValue: 'Cập nhật Thương hiệu',
                  })
                : t('catalog.brands.actions.register', {
                    defaultValue: 'Ghi danh Thương hiệu',
                  })}
            </span>

            {/* Studio gloss effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
