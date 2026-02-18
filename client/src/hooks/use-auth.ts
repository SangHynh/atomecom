import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { AuthService } from '@/services/auth.service';
import { useStore } from '@/store/useStore';
import { LoginInput, SignUpInput, USER_ROLE } from '@atomecom/shared';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useAuth = () => {
  const router = useRouter();
  const { setUser, logout: clearStore, user, isAuthenticated } = useStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => AuthService.login(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      
      // Save tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Update store
      setUser(user);
      
      toast.success('Logged in successfully');
      
      // Redirect based on role
      if (user.role === USER_ROLE.ADMIN) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
        toast.error(error.response?.data?.message || 'Login failed');
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: SignUpInput) => AuthService.register(data),
    onSuccess: (response) => {
       const { user, tokens } = response.data;

       // Save tokens
       localStorage.setItem('accessToken', tokens.accessToken);
       localStorage.setItem('refreshToken', tokens.refreshToken);
       
        // Update store
       setUser(user);

       toast.success('Account created successfully');
       router.push('/');
    },
    onError: (error: AxiosError<{ message: string }>) => {
        toast.error(error.response?.data?.message || 'Registration failed');
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
      // Always clear local state even if server logout fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      clearStore();
      router.push('/login');
      toast.success('Logged out');
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
