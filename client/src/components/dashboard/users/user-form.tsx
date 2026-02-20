import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, USER_ROLE } from '@atomecom/shared';
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
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      password: user
        ? z.string().optional()
        : z.string().min(6, t('users.actions.password_too_short')),
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {t('users.details.profile')}
              </h3>
              {isSelf && user && (
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  {t('users.form.editing_own_profile', {
                    defaultValue: 'Your Profile',
                  })}
                </span>
              )}
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('users.form.name')}{' '}
                    {(!user || isSelf) && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Ex: John Doe"
                        {...field}
                        disabled={!!user && !isSelf}
                        className="h-10 pl-10 bg-background border-border/60 focus:border-primary/60 focus-visible:ring-offset-0 focus:ring-2 focus:ring-primary/10 rounded-lg transition-all text-sm"
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
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t('users.details.email')}{' '}
                    {(!user || isSelf) && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        placeholder="example@atomecom.com"
                        {...field}
                        disabled={!!user && !isSelf}
                        className="h-10 pl-10 bg-background border-border/60 focus:border-primary/60 focus-visible:ring-offset-0 focus:ring-2 focus:ring-primary/10 rounded-lg transition-all text-sm"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {t('users.details.security_session')}
              </h3>
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
                        <ShieldAlert className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <SelectTrigger className="h-10 pl-10 bg-background border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/10 rounded-lg transition-all text-sm">
                          <SelectValue
                            placeholder={t('users.form.role_placeholder')}
                          />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent className="rounded-lg border-border/50 shadow-xl bg-background">
                      <SelectItem
                        value={USER_ROLE.USER}
                        className="py-2 cursor-pointer text-sm font-medium"
                      >
                        {t('users.form.role_user')}
                      </SelectItem>
                      {(currentUser?.role === USER_ROLE.OWNER ||
                        user?.role === USER_ROLE.ADMIN) && (
                        <SelectItem
                          value={USER_ROLE.ADMIN}
                          className="py-2 cursor-pointer text-sm font-medium"
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
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {user
                      ? t('users.form.password_new')
                      : t('users.form.password')}
                    {!user && <span className="text-red-500"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={
                          user ? 'Leave blank to keep current' : '••••••••'
                        }
                        {...field}
                        className="h-10 pl-10 pr-10 bg-background border-border/60 focus:border-primary/60 focus-visible:ring-offset-0 focus:ring-2 focus:ring-primary/10 rounded-lg transition-all text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px] font-medium text-red-500" />
                </FormItem>
              )}
            />

            {/* Verified toggle — only shown in edit mode for Admin/Owner */}
            {user && !isSelf && (
              <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <FormLabel className="text-xs font-semibold text-foreground uppercase tracking-wide cursor-pointer mb-0">
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
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          field.value
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/30',
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="pt-4"
        >
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
