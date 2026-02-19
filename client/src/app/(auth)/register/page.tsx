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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';

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
      // @ts-ignore
      honey_pot: '',
    },
  });

  const onSubmit: SubmitHandler<RegisterSchema> = (data) => {
    register(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50 rounded-3xl overflow-hidden bg-background/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-8">
          <CardTitle className="text-3xl font-black text-center tracking-tight">
            {t('auth.register', 'Register')}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground font-medium">
            {t(
              'auth.register_description',
              'Join the elite shopping experience',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SocialAuthButtons isLoading={isRegistering} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-tighter">
              <span className="bg-background px-4 text-muted-foreground font-bold">
                {t('auth.or_register_with', 'Or register with email')}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit as any)}
              className="space-y-4"
            >
              {' '}
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                      {t('auth.full_name', 'Full Name')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-primary/20 transition-all"
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                      {t('auth.email', 'Email Address')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        {...field}
                        className="h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-primary/20 transition-all"
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
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                        {t('auth.password', 'Password')}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="********"
                          {...field}
                          className="h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-primary/20 transition-all"
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
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                        {t('auth.confirm_password', 'Confirm')}
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="********"
                          {...field}
                          className="h-11 rounded-xl bg-muted/50 border-border/50 focus:ring-primary/20 transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* 🍯 Honey Pot Field (Hidden) */}
              <FormField
                control={form.control as any}
                name={'honey_pot' as any}
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>Fax</FormLabel>
                    <FormControl>
                      <Input {...field} tabIndex={-1} autoComplete="off" />
                    </FormControl>
                  </FormItem>
                )}
              />
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

          <div className="pt-2 text-center text-sm">
            <span className="text-muted-foreground font-medium">
              {t('auth.already_have_account', 'Already have an account?')}{' '}
            </span>
            <Link
              href="/login"
              className="text-primary font-bold hover:underline transition-all underline-offset-4"
            >
              {t('auth.sign_in_here', 'Sign In here')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
