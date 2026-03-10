'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category, PRODUCT_STATUS } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
  Loader2,
  Save,
  Laptop,
  Smartphone,
  Shirt,
  Watch,
  Home,
  Heart,
  Trophy,
  Gamepad,
  Car,
  Gift,
  Camera,
  Music,
  Book,
  Wrench,
  Check,
  Search,
  Tv,
  Speaker,
  Headphones,
  Coffee,
  Utensils,
  Baby,
  Dog,
  Cat,
  ShoppingBag,
  HardDrive,
  Cpu,
  Mouse,
  Keyboard,
  Monitor,
  Headset,
  Mic,
  Zap,
  Flame,
  Star,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Briefcase,
  GraduationCap,
  Globe,
  Plane,
  Map,
  Wallet,
  CreditCard,
  Banknote,
  Bell,
  Settings,
  User,
  Users,
  Shield,
  Lock,
  Unlock,
  Lightbulb,
  Rocket,
  Target,
  PieChart,
  BarChart3,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Image,
  Video,
  FileText,
  Folder,
  Layers,
  Layout,
  Palette,
  Tag,
  Footprints,
  Glasses,
  Flower2,
  Sprout,
  Hammer,
  ToyBrick,
  Stethoscope,
  Beaker,
  Sparkles,
  Apple,
  Pizza,
  Wheat,
  IceCream,
  Bike,
  Medal,
  Compass,
} from 'lucide-react';
import { CATEGORY_ICONS } from '@/lib/category-icons';

import { useCategories } from '@/hooks/use-categories';
import { generateSlug, cn } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/dashboard/confirmation-dialog';

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(), // Make optional for auto-gen
  description: z.string().optional(),
  icon: z.string().optional(),
  status: z.nativeEnum(PRODUCT_STATUS).default(PRODUCT_STATUS.PUBLISHED),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CategoryFormValues) => void;
  isLoading?: boolean;
}

export function CategoryForm({
  initialData,
  onSubmit,
  isLoading,
}: CategoryFormProps) {
  const { t } = useTranslation();
  // Fetch only level 1-4 categories to be potential parents (since max level is 5)
  const { categories: allCategories } = useCategories({ limit: 100 });

  const form = useForm<any>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      icon: initialData?.icon || 'Folder', // Set default icon
      status: (initialData as any)?.status || PRODUCT_STATUS.PUBLISHED,
    },
  });

  const [confirmSlug, setConfirmSlug] = React.useState<{
    isOpen: boolean;
    proposedSlug: string;
    formData: any;
  }>({ isOpen: false, proposedSlug: '', formData: null });

  const handlePreSubmit = (values: CategoryFormValues) => {
    if (!values.slug || values.slug.trim() === '') {
      const autoSlug = generateSlug(values.name);
      setConfirmSlug({
        isOpen: true,
        proposedSlug: autoSlug,
        formData: values,
      });
      return;
    }
    onSubmit(values);
  };

  const name = form.watch('name');
  // Remove auto-slug useEffect as per user request to have confirmation instead

  const [iconSearch, setIconSearch] = React.useState('');
  const filteredIcons = CATEGORY_ICONS.filter((item) =>
    item.name.toLowerCase().includes(iconSearch.toLowerCase()),
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handlePreSubmit)}
        className="space-y-10"
      >
        {/* Bento Grid Header - Editorial Style */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          {/* Name - Studio Editorial Focus */}
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
                        'relative bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-10 rounded-[32px] border border-white/40 dark:border-white/5 transition-all duration-500 cursor-text',
                        'shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)]',
                        'focus-within:border-primary/50 focus-within:ring-8 focus-within:ring-primary/5 focus-within:bg-white dark:focus-within:bg-zinc-950',
                      )}
                      onClick={() => {
                        const input = document.getElementById(
                          'category-name-input',
                        );
                        input?.focus();
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 transition-all duration-500 group-focus-within/name:text-primary group-focus-within/name:tracking-[0.6em]">
                          {t('catalog.categories.fields.name_label', {
                            defaultValue: 'Tên Danh mục',
                          })}
                        </FormLabel>
                        <Input
                          id="category-name-input"
                          placeholder="Type Category Name..."
                          {...field}
                          className="bg-transparent border-none text-4xl font-black tracking-tight text-foreground placeholder:text-muted-foreground/5 h-auto p-0 focus-visible:ring-0 shadow-none selection:bg-primary/30"
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
            className="md:col-span-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-[28px] border border-white/20 dark:border-white/5 shadow-sm group/slug hover:border-primary/20 transition-all duration-500"
          >
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">
                    {t('catalog.categories.fields.slug_label', {
                      defaultValue: 'Đường dẫn định danh',
                    })}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within/slug:text-primary group-focus-within/slug:scale-110 transition-all" />
                      <Input
                        placeholder={t(
                          'catalog.categories.fields.slug_placeholder',
                          { defaultValue: 'Đường dẫn tự động...' },
                        )}
                        {...field}
                        className="pl-10 rounded-2xl border-white/10 bg-white/50 dark:bg-zinc-950/50 font-mono text-[11px] h-12 shadow-none focus-visible:ring-2 focus-visible:ring-primary/10 focus-visible:border-primary/40 transition-all font-bold"
                        disabled={!!initialData}
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
            className="md:col-span-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-6 rounded-[28px] border border-white/20 dark:border-white/5 shadow-sm hover:border-primary/20 transition-all duration-500"
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
                      {t('catalog.categories.fields.status_label', {
                        defaultValue: 'Trạng thái hiển thị',
                      })}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-2xl border-white/10 bg-white/50 dark:bg-zinc-950/50 h-12 font-black text-[10px] uppercase shadow-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all">
                          <SelectValue
                            placeholder={t(
                              'catalog.categories.fields.status_placeholder',
                              { defaultValue: 'Chọn trạng thái' },
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
                            {status}
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
        </div>

        {/* Media Library UI - Icon Picker */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-zinc-900 dark:bg-white rounded-full" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
                {t('catalog.categories.fields.icon_label', {
                  defaultValue: 'Biểu tượng đại diện',
                })}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
              <Input
                placeholder={t(
                  'catalog.categories.fields.icon_search_placeholder',
                  { defaultValue: 'Lọc thư viện...' },
                )}
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="w-48 h-9 border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm text-[10px] pl-8 rounded-xl focus-visible:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar p-1">
            {filteredIcons.map((item) => {
              const IconComp = item.icon;
              const isActive = form.watch('icon') === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => form.setValue('icon', item.name)}
                  className={cn(
                    'aspect-square rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden group/icon',
                    'border-2',
                    isActive
                      ? 'bg-zinc-900 border-zinc-900 text-white scale-110 shadow-lg shadow-zinc-500/20'
                      : 'bg-white/50 dark:bg-white/5 border-transparent text-muted-foreground hover:bg-white dark:hover:bg-zinc-800 hover:border-white/20',
                  )}
                >
                  <IconComp
                    className={cn(
                      'w-5 h-5 transition-transform duration-500 group-hover/icon:scale-125',
                      !isActive && item.color,
                    )}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="active-icon-glow"
                      className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Global Context - Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">
                  {t('catalog.categories.fields.description_label', {
                    defaultValue: 'Mô tả chi tiết',
                  })}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      'catalog.categories.fields.description_placeholder',
                      {
                        defaultValue:
                          'Cung cấp mô tả chiến lược cho danh mục này...',
                      },
                    )}
                    {...field}
                    className="rounded-[24px] border border-white/20 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md focus-visible:ring-8 focus-visible:ring-primary/5 focus-visible:border-primary/40 min-h-[80px] p-6 text-[13px] shadow-sm transition-all resize-none font-medium leading-relaxed"
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold text-red-500/60 mt-2" />
              </FormItem>
            )}
          />
        </motion.div>

        {/* Submit Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full h-16 relative overflow-hidden group rounded-[22px] transition-all duration-500',
              'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.01] active:scale-[0.99]',
              'shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)]',
              'font-black uppercase tracking-[0.4em] text-[12px] gap-3',
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_0_50px_rgba(139,92,246,0.3)] dark:shadow-[0_0_50px_rgba(139,92,246,0.2)]" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {initialData
                ? t('catalog.categories.actions.update', {
                    defaultValue: 'Cập nhật Danh mục',
                  })
                : t('catalog.categories.actions.create', {
                    defaultValue: 'Khởi tạo Danh mục',
                  })}
            </span>

            {/* Glossy overlay effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </motion.div>

        {/* Confirmation Dialog for Auto-generated Slug */}
        <ConfirmationDialog
          isOpen={confirmSlug.isOpen}
          title={t('catalog.categories.confirmation.slug_title', {
            defaultValue: 'Xác nhận Slug tự động?',
          })}
          description={
            <div className="space-y-6 py-2">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {t('catalog.categories.confirmation.slug_description_part1', {
                  defaultValue:
                    'Hệ thống đã tự động tính toán một đường dẫn tối ưu (Slug) dựa trên bản sắc danh mục của sếp.',
                })}
              </p>
              <div className="p-6 bg-zinc-900/5 dark:bg-zinc-900/40 rounded-[28px] border border-zinc-900/5 dark:border-white/5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">
                  {t('catalog.categories.fields.slug_proposal', {
                    defaultValue: 'Đường dẫn đề xuất',
                  })}
                </p>
                <code className="text-primary font-mono text-xl font-black tracking-tight">
                  /{confirmSlug.proposedSlug}
                </code>
              </div>
              <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest text-center">
                {t('catalog.categories.confirmation.slug_description_part2', {
                  defaultValue: 'Sếp có muốn thực thi đường dẫn này không?',
                })}
              </p>
            </div>
          }
          variant="info"
          onClose={() =>
            setConfirmSlug({ ...confirmSlug, isOpen: false, formData: null })
          }
          onConfirm={() => {
            const finalData = {
              ...confirmSlug.formData,
              slug: confirmSlug.proposedSlug,
            };
            onSubmit(finalData);
            setConfirmSlug({ ...confirmSlug, isOpen: false, formData: null });
          }}
        />
      </form>
    </Form>
  );
}
