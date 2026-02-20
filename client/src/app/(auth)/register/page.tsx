'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterSchema } from '@atomecom/shared';
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

export default function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const { t } = useTranslation();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      honey_pot: '' as any,
    },
  });

  const onSubmit: SubmitHandler<RegisterSchema> = (data) => register(data);

  return (
    <AuthPageShell
      title={t('auth.register', 'Register')}
      description={t(
        'auth.register_description',
        'Join the elite shopping experience',
      )}
      dividerLabel={t('auth.or_register_with', 'Or register with email')}
      isLoading={isRegistering}
      footer={
        <>
          <span className="text-muted-foreground font-medium">
            {t('auth.already_have_account', 'Already have an account?')}{' '}
          </span>
          <Link
            href="/login"
            className="text-primary font-bold hover:underline transition-all underline-offset-4"
          >
            {t('auth.sign_in_here', 'Sign In here')}
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-4"
        >
          <FormField
            control={form.control as any}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL_CLS}>
                  {t('auth.full_name', 'Full Name')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
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
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <HoneyPotField control={form.control} />
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            disabled={isRegistering}
          >
            {isRegistering
              ? t('auth.signing_up', 'Signing Up...')
              : t('auth.create_account', 'Create Account')}
          </Button>
        </form>
      </Form>
    </AuthPageShell>
  );
}
