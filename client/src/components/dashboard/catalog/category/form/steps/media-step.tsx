import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MediaStepProps {
  form: UseFormReturn<any>;
}

export function MediaStep({ form }: MediaStepProps) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-12">
        <div className="sm:col-span-1 space-y-4">
          <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 block">
            Icon / Visual Representative
          </label>
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <div className="group relative aspect-square rounded-md border border-border/10 overflow-hidden bg-muted/5 flex items-center justify-center transition-all cursor-crosshair hover:border-primary/20 shadow-none">
                {field.value ? (
                  <>
                    <img
                      src={field.value}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      alt="Category preview"
                    />
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => field.onChange('')}
                        type="button"
                        className="h-8 px-3 rounded-md border border-border/10 font-bold text-[8px] uppercase tracking-wider text-muted-foreground/60"
                      >
                        Gỡ ảnh
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center px-4">
                    <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center opacity-40 group-hover:scale-110 transition-transform">
                      <Plus className="h-3 w-3" />
                    </div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/30">
                      Chọn tư liệu
                    </p>
                    <Input
                      title="Upload image"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          />
        </div>

        <div className="sm:col-span-3">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-3 block">
                  Mô tả đặc điểm nội dung
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={6}
                    placeholder="Ghi chú các tiêu chuẩn nội dung cho danh mục này..."
                    className="border border-border/10 rounded-md bg-muted/5 p-4 text-xs leading-relaxed resize-none shadow-none focus-visible:ring-0 focus-visible:border-primary/30 transition-all font-medium italic h-[160px]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
