import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AuthService } from '@/services/auth.service';
import { useStore } from '@/store/useStore';
import { LoginInput, SignUpInput, USER_ROLE } from '@atomecom/shared';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const useAuth = () => {
  const router = useRouter();
  const { setUser, logout: clearStore, user, isAuthenticated } = useStore();
  const { t } = useTranslation();

  const handleAuthError = (error: AxiosError<{ message: string }>, defaultKey: string) => {
    const errorCode = error.response?.data?.message;
    
    if (errorCode && t(`errors.${errorCode}`, { ns: 'errors', defaultValue: '' })) {
      toast.error(t(`errors.${errorCode}`, { ns: 'errors' }));
    } else if (error.response?.status === 500) {
      toast.error(t('generic', { ns: 'errors' }));
    } else {
      toast.error(t(defaultKey, { defaultValue: errorCode || 'Error' }));
    }
  };

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => AuthService.login(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      setUser(user);
      toast.success(t('auth.login_success', { defaultValue: 'Logged in successfully' }));
      
      if (user.role === USER_ROLE.ADMIN) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
        handleAuthError(error, 'auth.login_failed');
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: SignUpInput) => AuthService.register(data),
    onSuccess: (response) => {
       const { user, tokens } = response.data;
       localStorage.setItem('accessToken', tokens.accessToken);
       localStorage.setItem('refreshToken', tokens.refreshToken);
       setUser(user);
       toast.success(t('auth.register_success', { defaultValue: 'Account created successfully' }));
       router.push('/');
    },
    onError: (error: AxiosError<{ message: string }>) => {
        handleAuthError(error, 'auth.register_failed');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if(refreshToken) {
            await AuthService.logout({ refreshToken });
        }
    },
    onSettled: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      clearStore();
      router.push('/login');
      toast.success(t('auth.logout_success', { defaultValue: 'Logged out' }));
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
  };
};
