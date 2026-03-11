import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Category, PRODUCT_STATUS } from '@atomecom/shared';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface IdentityStepProps {
  form: UseFormReturn<any>;
  categories?: Category[];
  currentCategoryId?: string;
}

export function IdentityStep({
  form,
  categories,
  currentCategoryId,
}: IdentityStepProps) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
              Tên gọi định danh phân loại
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Ví dụ: Đồ gia dụng, Smartphone..."
                className="h-12 text-xl font-semibold border-0 border-b border-border/80 bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all placeholder:text-muted-foreground/20 shadow-none"
              />
            </FormControl>
            <FormMessage className="text-[10px] font-medium mt-1.5" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
                Phân cấp cha (Parent)
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || 'root'}
              >
                <FormControl>
                  <SelectTrigger className="h-11 border border-border/60 rounded-md bg-muted/5 px-4 font-semibold text-sm shadow-none focus:ring-0">
                    <SelectValue placeholder="Chọn danh mục cha" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-md border-border/40 shadow-none">
                  <SelectItem
                    value="root"
                    className="text-[10px] font-bold uppercase tracking-wide py-2.5 italic"
                  >
                    -- Danh mục gốc --
                  </SelectItem>
                  {categories
                    ?.filter((c) => c.id !== currentCategoryId)
                    .map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="text-xs font-semibold uppercase py-2.5"
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
              <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
                Trạng thái trình bày
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 border border-border/60 rounded-md bg-muted/5 px-4 font-bold text-[10px] uppercase tracking-wide shadow-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-md border-border/40 shadow-none">
                  {Object.values(PRODUCT_STATUS).map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="text-[10px] font-bold uppercase py-2"
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

      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
              Đường dẫn SEO (Slug)
            </FormLabel>
            <FormControl>
              <div className="relative group">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-tighter opacity-30 group-focus-within:opacity-50 transition-opacity">
                  /category/
                </div>
                <Input
                  {...field}
                  className="h-10 pl-16 border-0 border-b border-border/60 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all font-mono text-xs shadow-none"
                />
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
