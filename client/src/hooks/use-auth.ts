import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AuthService } from '@/services/auth.service';
import { useStore } from '@/store/useStore';
import { setAccessToken } from '@/lib/axios';
import { LoginInput, SignUpInput, USER_ROLE } from '@atomecom/shared';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const useAuth = () => {
  const router = useRouter();
  const { setUser, logout: clearStore, user, isAuthenticated } = useStore();
  const { t } = useTranslation();

  const handleAuthError = (
    error: AxiosError<{ message: string }>,
    defaultKey: string,
  ) => {
    const errorCode = error.response?.data?.message;

    if (
      errorCode &&
      t(`errors.${errorCode}`, { ns: 'errors', defaultValue: '' })
    ) {
      toast.error(t(`errors.${errorCode}`, { ns: 'errors' }));
    } else if (error.response?.status === 500) {
      toast.error(t('generic', { ns: 'errors' }));
    } else {
      toast.error(t(defaultKey, { defaultValue: errorCode || 'Error' }));
    }
  };

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput & { honey_pot?: string }) =>
      AuthService.login(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      setAccessToken(tokens.accessToken);
      setUser(user);
      toast.success(
        t('auth.login_success', { defaultValue: 'Logged in successfully' }),
      );

      if (user.role === USER_ROLE.ADMIN) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      handleAuthError(error, 'auth.login_failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: SignUpInput & { honey_pot?: string }) =>
      AuthService.register(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      setAccessToken(tokens.accessToken);
      setUser(user);
      toast.success(
        t('auth.register_success', {
          defaultValue: 'Account created successfully',
        }),
      );
      router.push('/');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      handleAuthError(error, 'auth.register_failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AuthService.logout();
    },
    onSettled: () => {
      setAccessToken(null);
      localStorage.removeItem('accessToken'); // Cleanup legacy
      clearStore();
      router.push('/login');
      toast.success(t('auth.logout_success', { defaultValue: 'Logged out' }));
    },
  });

  const socialLoginMutation = useMutation({
    mutationFn: ({ provider, token }: { provider: string; token: string }) =>
      AuthService.socialLogin(provider, token),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      setAccessToken(tokens.accessToken);
      setUser(user);
      toast.success(
        t('auth.login_success', { defaultValue: 'Logged in successfully' }),
      );
      router.push('/');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      handleAuthError(error, 'auth.social_login_failed');
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    socialLogin: socialLoginMutation.mutate,
    isSocialLoggingIn: socialLoginMutation.isPending,
  };
};
