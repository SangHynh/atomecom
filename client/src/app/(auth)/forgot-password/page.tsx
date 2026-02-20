'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordSchema } from '@atomecom/shared';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { ChevronLeft } from 'lucide-react';

const INPUT_CLS =
  'h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-primary/20 transition-all';
const LABEL_CLS =
  'text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1';

export default function ForgotPasswordPage() {
  const { forgotPassword, isForgottingPassword } = useAuth();
  const { t } = useTranslation();

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit: SubmitHandler<ForgotPasswordSchema> = (data) =>
    forgotPassword(data.email);

  return (
    <AuthPageShell
      title={t('auth.forgot_password', 'Forgot Password')}
      description={t(
        'auth.forgot_password_desc',
        'Enter your email to receive a reset link',
      )}
      showSocialButtons={false}
      footer={
        <Link
          href="/login"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold hover:underline transition-all underline-offset-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('auth.back_to_login', 'Back to Login')}
        </Link>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL_CLS}>
                  {t('auth.email', 'Email Address')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
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
            disabled={isForgottingPassword}
          >
            {isForgottingPassword
              ? t('auth.sending_link', 'Sending...')
              : t('auth.send_reset_link', 'Send Reset Link')}
          </Button>
        </form>
      </Form>
    </AuthPageShell>
  );
}
