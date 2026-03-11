'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShieldCheck, Lock } from 'lucide-react';
import { User, USER_ROLE } from '@atomecom/shared';

interface SecurityStepProps {
  form: UseFormReturn<any>;
  user?: User;
}

export function SecurityStep({ form, user }: SecurityStepProps) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-3 block">
              Thiết lập vai trò & Phân cấp
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="h-14 border border-border/10 rounded-md bg-muted/5 px-6 font-bold uppercase tracking-wide text-[11px] shadow-none">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-md border-border/10 shadow-none">
                {Object.values(USER_ROLE).map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    className="text-[10px] font-bold uppercase tracking-wide py-3"
                  >
                    {role === USER_ROLE.ADMIN
                      ? 'Quản trị viên'
                      : role === USER_ROLE.OWNER
                        ? 'Chủ sở hữu'
                        : 'Khách hàng (User)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {!user && (
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-3 block">
                Mật khẩu khởi tạo
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    className="h-10 pl-7 border-0 border-b border-border/20 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all font-mono text-base shadow-none"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {user && (
        <div className="p-6 rounded-sm border-[0.5px] border-amber-500/20 bg-amber-500/[0.03] space-y-2">
          <div className="flex items-center gap-2 text-amber-600/80">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Giao thức bảo mật
            </span>
          </div>
          <p className="text-[10px] text-amber-700/60 font-medium leading-relaxed">
            Các trường thông tin nhạy cảm đã được khóa bảo vệ. Để thay đổi mật
            khẩu, vui lòng sử dụng tính năng "Đặt lại mật khẩu" trong phần cài
            đặt tài khoản nâng cao.
          </p>
        </div>
      )}
    </div>
  );
}
