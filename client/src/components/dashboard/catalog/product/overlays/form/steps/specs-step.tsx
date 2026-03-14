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
import { Button } from '@/components/ui/button';
import { Activity, Plus, Trash2 } from 'lucide-react';
import { StudioField } from '@/components/dashboard/studio/studio-field';
import { StudioInput } from '@/components/dashboard/studio/studio-input';

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
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-foreground/40" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">
              Thông số kỹ thuật (Technical Specs)
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSpec}
            className="h-8 px-4 text-[9px] font-black uppercase tracking-widest gap-2 rounded-none border-border/40 hover:bg-foreground hover:text-background transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm thông số
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {specs.map((_: any, index: number) => (
            <div
              key={index}
              className="group relative grid grid-cols-1 md:grid-cols-2 gap-8 p-10 rounded-[var(--radius)] border border-border/20 bg-muted/5 hover:bg-muted/10 transition-all"
            >
              <FormField
                control={form.control}
                name={`specs.${index}.key`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StudioField label="Tên thông số (e.g. Chất liệu)">
                        <StudioInput
                          {...field}
                          placeholder="VD: Chất liệu, Kích thước..."
                          className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-xs font-bold"
                        />
                      </StudioField>
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
                    <div className="flex items-end gap-6">
                      <FormControl className="flex-1">
                        <StudioField label="Giá trị (e.g. Cotton 100%)">
                          <StudioInput
                            {...field}
                            placeholder="VD: Cotton, 1.5kg, 120cm..."
                            className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground/40 transition-all shadow-none text-sm font-black"
                          />
                        </StudioField>
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpec(index)}
                        className="h-10 w-10 text-muted-foreground/20 hover:text-danger-soft hover:bg-danger-soft/5 transition-all shrink-0 rounded-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-widest">
                  #{index + 1} Spec Node
                </span>
              </div>
            </div>
          ))}

          {specs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border/20 rounded-[var(--radius)] bg-muted/5 group hover:bg-muted/10 transition-all cursor-pointer" onClick={addSpec}>
              <div className="h-12 w-12 rounded-full border border-border/20 border-dashed flex items-center justify-center mb-6 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.2em] mb-6">
                Chưa có dữ liệu thông số kỹ thuật
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-6 text-[9px] font-black uppercase tracking-widest rounded-none border-border/40 hover:bg-foreground hover:text-background transition-all"
              >
                Khởi tạo Node thông số đầu tiên
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}





