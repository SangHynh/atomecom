'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordSchema } from '@atomecom/shared';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { toast } from 'sonner';

const INPUT_CLS =
  'h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-primary/20 transition-all';
const LABEL_CLS =
  'text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1';

function ResetPasswordForm() {
  const { resetPassword, isResettingPassword } = useAuth();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error(t('auth.verify_email.no_token', 'Invalid token'));
    }
  }, [token, t]);

  const onSubmit: SubmitHandler<ResetPasswordSchema> = (data) =>
    resetPassword({
      token: data.token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control as any}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLS}>
                {t('auth.new_password', 'New Password')}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  {...field}
                  className={INPUT_CLS}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLS}>
                {t('auth.confirm_password', 'Confirm')}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  {...field}
                  className={INPUT_CLS}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          disabled={isResettingPassword || !token}
        >
          {isResettingPassword
            ? t('auth.updating_password', 'Updating...')
            : t('auth.update_password', 'Update Password')}
        </Button>
      </form>
    </Form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();

  return (
    <AuthPageShell
      title={t('auth.reset_password', 'Reset Password')}
      description={t('auth.reset_password_desc', 'Create a new password')}
      showSocialButtons={false}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
