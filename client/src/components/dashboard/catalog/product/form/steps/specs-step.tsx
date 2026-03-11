'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormSchema } from '@atomecom/shared';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Activity, Plus, Trash2 } from 'lucide-react';

interface SpecsStepProps {
  form: UseFormReturn<ProductFormSchema>;
}

export function SpecsStep({ form }: SpecsStepProps) {
  const specs = form.watch('specs') || [];

  const addSpec = () => {
    form.setValue('specs', [...specs, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    form.setValue('specs', newSpecs);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-foreground/90">
              Thông số kỹ thuật (Technical Specs)
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSpec}
            className="h-8 px-3 text-[10px] font-bold uppercase tracking-tight gap-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-primary transition-all"
          >
            <Plus className="h-3 w-3" /> Thêm thông số
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {specs.map((_: any, index: number) => (
            <div
              key={index}
              className="group relative grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-sm border border-border/40 bg-muted/5 hover:bg-muted/10 transition-all"
            >
              <FormField
                control={form.control}
                name={`specs.${index}.key`}
                render={({ field }) => (
                  <FormItem>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
                      Tên thông số (e.g. Chất liệu)
                    </label>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="VD: Chất liệu, Kích thước..."
                        className="h-10 rounded-sm bg-background border-border text-xs focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`specs.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
                      Giá trị (e.g. Cotton 100%)
                    </label>
                    <div className="flex items-center gap-3">
                      <FormControl className="flex-1">
                        <Input
                          {...field}
                          placeholder="VD: Cotton, 1.5kg, 120cm..."
                          className="h-10 rounded-sm bg-background border-border text-xs focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-semibold"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpec(index)}
                        className="h-10 w-10 text-muted-foreground/20 hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          {specs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/40 rounded-sm bg-muted/5">
              <Activity className="h-8 w-8 text-muted-foreground/20 mb-4" />
              <p className="text-xs text-muted-foreground/40 font-medium">
                Chưa có thông số kỹ thuật nào được thêm.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addSpec}
                className="mt-4 text-[10px] font-bold uppercase tracking-tight text-primary hover:bg-primary/5"
              >
                Thêm thông số đầu tiên
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
