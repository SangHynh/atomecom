'use client';

import React, { useState } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  createUserSchema,
  USER_ROLE,
  CreateUserSchema,
} from '@atomecom/shared';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User as UserIcon, ShieldCheck, Mail, Phone, Lock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type UserFormData = CreateUserSchema;

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => void;
  isLoading?: boolean;
}

export function UserForm({ user, onSubmit, isLoading }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      email: user?.email || '',
      name: user?.name || '',
      phone: user?.phone || '',
      role: (user?.role as USER_ROLE) || USER_ROLE.USER,
      password: '',
      addresses: user?.addresses || [],
    } as DefaultValues<UserFormData>,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full bg-background relative overflow-hidden"
      >
        <div className="flex-1 overflow-visible px-8 py-10">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Row 1: Primary Identity */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                    Định danh chủ tài khoản
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nguyễn Văn A"
                      className="h-14 text-2xl font-semibold border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all placeholder:text-muted-foreground/20 shadow-none"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-medium mt-1.5" />
                </FormItem>
              )}
            />

            {/* Row 2: Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                      Địa chỉ Email hệ thống
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input
                          {...field}
                          disabled={!!user}
                          className="h-10 pl-8 border-b border-border/60 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all font-semibold text-sm shadow-none disabled:opacity-50"
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
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                      Đường dây liên lạc
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Phone className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                        <Input
                          {...field}
                          placeholder="09xx xxx xxx"
                          className="h-10 pl-8 border-b border-border/60 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all font-semibold text-sm shadow-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Security & Permissions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                      Vai trò quản trị
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 border-b border-border/60 bg-transparent rounded-none px-0 font-semibold uppercase tracking-wide text-xs shadow-none hover:border-primary transition-all text-foreground/90">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-sm border-border/40 shadow-none">
                        {Object.values(USER_ROLE).map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            className="text-[10px] font-bold uppercase py-3"
                          >
                            {role === USER_ROLE.ADMIN
                              ? 'ADMINISTRATOR'
                              : role === USER_ROLE.OWNER
                                ? 'OWNER (SUPER)'
                                : 'REGULAR USER'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {!user ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                        Mật khẩu khởi tạo
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            className="h-10 pl-8 border-b border-border/60 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-primary transition-all font-mono text-base shadow-none"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : (
                <div className="pb-3 border-b border-border/40 flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-500/60" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">
                    Giao thức bảo mật đã kích hoạt
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-20 px-10 border-t border-border/60 bg-background flex items-center justify-end shrink-0">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 px-8 rounded-md bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-wide text-[11px] gap-3 shadow-md active:scale-[0.98] transition-all"
          >
            {user ? 'Cập nhật tài khoản' : 'Phát hành tài khoản'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
