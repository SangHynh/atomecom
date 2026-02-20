import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, USER_ROLE, ErrorUserCodes } from '@atomecom/shared';
import {
  Form,
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
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Schema is now defined inside component for dynamic validation
type FormValues = {
  name: string;
  email: string;
  password?: string;
  role: USER_ROLE;
  isVerified?: boolean;
  addresses?: any[];
};

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  canEditRole?: boolean;
  isSelf?: boolean;
  currentUser?: User;
}

export function UserForm({
  user,
  onSubmit,
  isLoading,
  canEditRole = false,
  isSelf = false,
  currentUser,
}: UserFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);

  const formSchema = React.useMemo(() => {
    return z.object({
      name: z
        .string()
        .min(
          2,
          t(`errors.${ErrorUserCodes.INVALID_NAME_FORMAT}`, { ns: 'errors' }),
        ),
      email: z
        .string()
        .email(
          t(`errors.${ErrorUserCodes.INVALID_EMAIL_FORMAT}`, { ns: 'errors' }),
        ),
      password: user
        ? z.string().optional()
        : z
            .string()
            .min(
              8,
              t(`errors.${ErrorUserCodes.PASSWORD_TOO_SHORT}`, {
                ns: 'errors',
              }),
            )
            .regex(
              /[A-Z]/,
              t(`errors.${ErrorUserCodes.PASSWORD_NEED_UPPERCASE}`, {
                ns: 'errors',
              }),
            )
            .regex(
              /[0-9]/,
              t(`errors.${ErrorUserCodes.PASSWORD_NEED_NUMBER}`, {
                ns: 'errors',
              }),
            )
            .regex(
              /[^a-zA-Z0-9]/,
              t(`errors.${ErrorUserCodes.PASSWORD_NEED_SPECIAL_CHAR}`, {
                ns: 'errors',
              }),
            ),
      addresses: z.array(z.any()).optional(),
      role: z.nativeEnum(USER_ROLE),
      isVerified: z.boolean().optional(),
    });
  }, [user, t]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: (user?.role as USER_ROLE) || USER_ROLE.USER,
      password: '',
      addresses: user?.addresses || [],
      isVerified: user?.isVerified || false,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: (user.role as USER_ROLE) || USER_ROLE.USER,
        password: '',
        addresses: user.addresses || [],
        isVerified: user.isVerified || false,
      });
    } else if (currentUser?.role === USER_ROLE.ADMIN && !user) {
      // If Admin creating user, force default role to USER
      form.setValue('role', USER_ROLE.USER);
    }
  }, [user, form, currentUser]);

  const handleSubmit = (values: FormValues) => {
    const submitData = { ...values };
    // If editing and password is empty, remove it
    if (user && !submitData.password) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 shrink-0 flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-primary/70" />
                {t('users.details.profile')}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent" />
            </div>
            {isSelf && user && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                {t('users.form.editing_own_profile', {
                  defaultValue: 'Your Profile',
                })}
              </span>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/80">
                    {t('users.form.name')}{' '}
                    {(!user || isSelf) && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300 z-10" />
                      <Input
                        placeholder="Ex: John Doe"
                        {...field}
                        disabled={!!user && !isSelf}
                        className="h-10 pl-9 bg-background border-border/50 hover:border-border/70 focus-visible:bg-background focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:shadow-[0_0_12px_rgba(139,92,246,0.15)] focus-visible:ring-offset-0 rounded-xl transition-all duration-300 text-sm placeholder:text-muted-foreground/40"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px] font-medium text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/80">
                    {t('users.details.email')}{' '}
                    {(!user || isSelf) && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300 z-10" />
                      <Input
                        type="email"
                        placeholder="example@atomecom.com"
                        {...field}
                        disabled={!!user && !isSelf}
                        className="h-10 pl-9 bg-background border-border/50 hover:border-border/70 focus-visible:bg-background focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:shadow-[0_0_12px_rgba(139,92,246,0.15)] focus-visible:ring-offset-0 rounded-xl transition-all duration-300 text-sm placeholder:text-muted-foreground/40"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px] font-medium text-red-500" />
                </FormItem>
              )}
            />
            {/* Phone field removed */}
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-violet-500/40 to-transparent" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 shrink-0 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-violet-500/80" />
                {t('users.details.security_session')}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-l from-violet-500/40 to-transparent" />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/80">
                    {t('users.form.role')}{' '}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={
                      (!canEditRole && !!user) ||
                      (currentUser?.role !== USER_ROLE.OWNER && !user)
                    }
                  >
                    <FormControl>
                      <div className="relative group">
                        <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300 z-10 pointer-events-none" />
                        <SelectTrigger className="h-10 pl-9 bg-background border-border/50 hover:border-border/70 focus:bg-background focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:shadow-[0_0_12px_rgba(139,92,246,0.15)] rounded-xl transition-all duration-300 text-sm">
                          <SelectValue
                            placeholder={t('users.form.role_placeholder')}
                          />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/40 shadow-2xl backdrop-blur-xl bg-background/90 p-1">
                      <SelectItem
                        value={USER_ROLE.USER}
                        className="py-2 cursor-pointer text-xs font-bold rounded-lg focus:bg-primary/10"
                      >
                        {t('users.form.role_user')}
                      </SelectItem>
                      {(currentUser?.role === USER_ROLE.OWNER ||
                        user?.role === USER_ROLE.ADMIN) && (
                        <SelectItem
                          value={USER_ROLE.ADMIN}
                          className="py-2 cursor-pointer text-xs font-bold rounded-lg focus:bg-primary/10"
                        >
                          {t('users.form.role_admin')}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px] font-medium text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground/80">
                    {user
                      ? t('users.form.password_new')
                      : t('users.form.password')}
                    {!user && <span className="text-red-500"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300 z-10" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={
                          user ? 'Leave blank to keep current' : '••••••••'
                        }
                        {...field}
                        className="h-10 pl-9 pr-10 bg-background border-border/50 hover:border-border/70 focus-visible:bg-background focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:shadow-[0_0_12px_rgba(139,92,246,0.15)] focus-visible:ring-offset-0 rounded-xl transition-all duration-300 text-sm placeholder:text-muted-foreground/40"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10 text-muted-foreground/50 hover:text-foreground hover:bg-transparent transition-colors z-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5 hover:scale-110 transition-transform" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 hover:scale-110 transition-transform" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <div className="flex flex-col gap-1 mt-1 px-0.5">
                    <p className="text-[11px] text-muted-foreground/80 font-medium">
                      {t('users.form.password_requirement')}
                    </p>
                    <FormMessage className="text-[11px] font-medium text-red-500" />
                  </div>
                </FormItem>
              )}
            />

            {/* Verified toggle — only shown in edit mode for Admin/Owner */}
            {user && !isSelf && (
              <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-3 bg-muted/20 hover:bg-muted/30 hover:border-border/70 transition-all">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <FormLabel className="text-xs font-black uppercase tracking-wide cursor-pointer mb-0">
                        {t('users.form.verified', {
                          defaultValue: 'Email Verified',
                        })}
                      </FormLabel>
                    </div>
                    <FormControl>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={field.value}
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          field.value
                            ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                            : 'bg-muted-foreground/30',
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
                            field.value ? 'translate-x-4' : 'translate-x-0',
                          )}
                        />
                      </button>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18, ease: 'easeOut' }}
          className="pt-4"
        >
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-primary/20 transition-all bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/30 hover:shadow-xl hover:scale-[1.015] active:scale-[0.985] border-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('users.form.processing')}
              </>
            ) : (
              <span className="flex items-center gap-2">
                {user ? t('users.form.save') : t('users.form.create')}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
