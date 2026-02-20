'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginSchema } from '@atomecom/shared';
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
import { PasswordInput } from '@/components/ui/password-input';
import Link from 'next/link';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { HoneyPotField } from '@/components/auth/honey-pot-field';

const INPUT_CLS =
  'h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-primary/20 transition-all';
const LABEL_CLS =
  'text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1';

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const { t } = useTranslation();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', honey_pot: '' as any },
  });

  const onSubmit: SubmitHandler<LoginSchema> = (data) => login(data);

  return (
    <AuthPageShell
      title={t('auth.login', 'Login')}
      description={t(
        'auth.login_description',
        'Enter your credentials to continue',
      )}
      dividerLabel={t('auth.or_continue_with', 'Or continue with email')}
      isLoading={isLoggingIn}
      footer={
        <>
          <span className="text-muted-foreground font-medium">
            {t('auth.new_here', 'New here?')}{' '}
          </span>
          <Link
            href="/register"
            className="text-primary font-bold hover:underline transition-all underline-offset-4"
          >
            {t('auth.create_account', 'Create an account')}
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <FormField
            control={form.control as any}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL_CLS}>
                  {t('auth.password', 'Password')}
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
          <HoneyPotField control={form.control} />
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            disabled={isLoggingIn}
          >
            {isLoggingIn
              ? t('auth.logging_in', 'Logging in...')
              : t('auth.sign_in', 'Sign In')}
          </Button>
        </form>
      </Form>
    </AuthPageShell>
  );
}
