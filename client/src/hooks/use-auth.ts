import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AuthService } from '@/services/auth.service';
import { useStore } from '@/store/useStore';
import { setAccessToken } from '@/lib/axios';
import {
  LoginSchema,
  RegisterSchema,
  ClientErrorCodes,
  USER_ROLE,
  ResetPasswordSchema,
} from '@atomecom/shared';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const useAuth = () => {
  const router = useRouter();
  const {
    setUser,
    logout: logoutStore,
    user,
    isAuthenticated,
    hasHydrated,
  } = useStore();
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
    mutationFn: (data: LoginSchema) => AuthService.login(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      setAccessToken(tokens.accessToken);
      localStorage.removeItem('explicitLogout');
      setUser(user);
      toast.success(
        t('auth.login_success', { defaultValue: 'Logged in successfully' }),
      );

      if (user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.OWNER) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      handleAuthError(error, ClientErrorCodes.LOGIN_FAILED);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterSchema) => AuthService.register(data),
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
      handleAuthError(error, ClientErrorCodes.REGISTER_FAILED);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AuthService.logout();
    },
    onSettled: () => {
      setAccessToken(null);
      localStorage.removeItem('accessToken'); // Cleanup legacy
      localStorage.setItem('explicitLogout', 'true'); // Prevent auto-refresh
      logoutStore();
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
      if (user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.OWNER) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      handleAuthError(error, ClientErrorCodes.SOCIAL_LOGIN_FAILED);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => AuthService.forgotPassword(email),
    onSuccess: () => {
      toast.success(
        t('auth.forgot_password_success', {
          defaultValue: 'Password reset link sent to your email',
        }),
      );
      router.push('/login');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      handleAuthError(error, 'FAIL');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordSchema) => AuthService.resetPassword(data),
    onSuccess: () => {
      toast.success(
        t('auth.reset_password_success', {
          defaultValue: 'Password character reset successfully',
        }),
      );
      router.push('/login');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      handleAuthError(error, 'FAIL');
    },
  });

  return {
    user,
    isAuthenticated,
    hasHydrated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    socialLogin: socialLoginMutation.mutate,
    isSocialLoggingIn: socialLoginMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutate,
    isForgottingPassword: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    isResettingPassword: resetPasswordMutation.isPending,
  };
};
