'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Mail, Phone } from 'lucide-react';
import { User } from '@atomecom/shared';

interface IdentityStepProps {
  form: UseFormReturn<any>;
  user?: User;
}

export function IdentityStep({ form, user }: IdentityStepProps) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
              Định danh chủ tài khoản
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Nguyễn Văn A"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
                Địa chỉ Email hệ thống
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                  <Input
                    {...field}
                    disabled={!!user}
                    className="h-10 pl-7 border-0 border-b border-border/60 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all font-semibold text-sm shadow-none disabled:opacity-50"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
                Đường dây liên lạc
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Phone className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                  <Input
                    {...field}
                    placeholder="09xx xxx xxx"
                    className="h-10 pl-7 border-0 border-b border-border/60 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all font-semibold text-sm shadow-none"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
