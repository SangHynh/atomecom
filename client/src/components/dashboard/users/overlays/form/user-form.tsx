'use client';

import {
  User,
  USER_ROLE,
  CreateUserSchema,
} from '@atomecom/shared';
import { useUserForm } from '@/hooks/use-user-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { User as UserIcon, ShieldCheck, Mail, Phone, Lock, Save, Plus } from 'lucide-react';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StudioField } from '@/components/dashboard/studio/studio-field';
import { StudioInput } from '@/components/dashboard/studio/studio-input';
import { StudioSelect } from '@/components/dashboard/studio/studio-select';
import { StudioFormHeader } from '@/components/dashboard/studio/studio-form-header';
import { StudioFormFooter } from '@/components/dashboard/studio/studio-form-footer';
import { handleBackendValidationError } from '@/lib/form-utils';

type UserFormData = CreateUserSchema;

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => void;
  isLoading?: boolean;
}

export function UserForm({ user, onSubmit, isLoading }: UserFormProps) {
  const { form, handleActualSubmit } = useUserForm({ user, onSubmit });

  const steps = [{ id: 'general', title: 'Thông tin chung', icon: UserIcon }];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleActualSubmit)}
        className="flex flex-col h-full bg-background"
      >
        <StudioFormHeader
          steps={steps}
          currentStep={0}
        />

        <div className="flex-1 overflow-y-auto px-8 py-10">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Row 1: Primary Identity */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <StudioField
                      label="Định danh chủ tài khoản"
                      required
                    >
                      <StudioInput
                        {...field}
                        placeholder="NGUYỄN VĂN A"
                        className="h-14 text-2xl font-black border-0 border-b border-border bg-transparent rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground transition-all placeholder:text-muted-foreground/10 shadow-none uppercase tracking-tighter"
                      />
                    </StudioField>
                  </FormControl>
                  <FormMessage className="text-[9px] font-bold mt-2 uppercase tracking-wide text-danger-soft" />
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
                    <FormControl>
                      <StudioField label="Địa chỉ Email hệ thống" required>
                        <div className="relative group">
                          <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/20 group-focus-within:text-foreground transition-colors" />
                          <StudioInput
                            {...field}
                            disabled={!!user}
                            className="h-10 pl-8 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all font-black text-sm shadow-none disabled:opacity-30 tracking-tight"
                          />
                        </div>
                      </StudioField>
                    </FormControl>
                    <FormMessage className="text-[9px] font-bold mt-2 uppercase tracking-wide text-danger-soft" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StudioField label="Đường dây liên lạc">
                        <div className="relative group">
                          <Phone className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/20 group-focus-within:text-foreground transition-colors" />
                          <StudioInput
                            {...field}
                            placeholder="09xx xxx xxx"
                            className="h-10 pl-8 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all font-black text-sm shadow-none tracking-tight"
                          />
                        </div>
                      </StudioField>
                    </FormControl>
                    <FormMessage className="text-[9px] font-bold mt-2 uppercase tracking-wide text-danger-soft" />
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
                    <FormControl>
                      <StudioSelect
                        label="Vai trò quản trị"
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="h-10 border-0 border-b border-border/40 bg-transparent rounded-none px-0 font-black uppercase tracking-[0.15em] text-[10px] shadow-none hover:border-foreground transition-all text-foreground/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-border/40 shadow-2xl bg-background/95 backdrop-blur-xl">
                          {Object.values(USER_ROLE).map((role) => (
                            <SelectItem
                              key={role}
                              value={role}
                              className="text-[10px] font-black uppercase py-3.5 px-4 tracking-[0.1em] focus:bg-foreground focus:text-background transition-colors rounded-none"
                            >
                              {role === USER_ROLE.ADMIN
                                ? 'ADMINISTRATOR'
                                : role === USER_ROLE.OWNER
                                  ? 'OWNER (SUPER)'
                                  : 'REGULAR USER'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </StudioSelect>
                    </FormControl>
                  </FormItem>
                )}
              />

              {!user ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <StudioField label="Mật khẩu khởi tạo">
                          <div className="relative group">
                            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/20 group-focus-within:text-foreground transition-colors" />
                            <StudioInput
                              {...field}
                              type="password"
                              placeholder="••••••••"
                              mono
                              className="h-10 pl-8 border-0 border-b border-border/40 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-foreground transition-all shadow-none"
                            />
                          </div>
                        </StudioField>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : (
                <div className="pb-3 border-b border-border/40 flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-foreground/20" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">
                    Giao thức bảo mật đã kích hoạt
                  </span>
                </div>
              )}
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
          submitLabel={user ? 'Cập nhật tài khoản' : 'Phát hành tài khoản'}
        />
      </form>
    </Form>
  );
}





