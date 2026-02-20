import { z } from 'zod';
import {
  ErrorAuthCodes,
  ErrorUserCodes,
  ClientErrorCodes,
} from '../constants/error.constants.js';
import { OauthProvider } from '../enums/oauthProvider.enum.js';

// 1. Register
export const RegisterRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT),
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
    password: z
      .string()
      .min(8, ErrorUserCodes.PASSWORD_TOO_SHORT)
      .regex(/[A-Z]/, ErrorUserCodes.PASSWORD_NEED_UPPERCASE)
      .regex(/[0-9]/, ErrorUserCodes.PASSWORD_NEED_NUMBER)
      .regex(/[^a-zA-Z0-9]/, ErrorUserCodes.PASSWORD_NEED_SPECIAL_CHAR),
    phone: z.string().min(10, ErrorUserCodes.INVALID_PHONE_FORMAT).optional(),
    honey_pot: z.string().optional(),
  }),
});

// 2. Login
export const LoginRequestSchema = z.object({
  body: z.object({
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
    password: z.string().min(1, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
    honey_pot: z.string().optional(),
  }),
});

// 3. Refresh Token & Logout
export const TokenRequestSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
  cookies: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

// 4. Verify Email (Query Params)
export const VerifyEmailRequestSchema = z.object({
  query: z.object({
    token: z.string().min(1, ErrorAuthCodes.INVALID_OPAQUE_TOKEN),
  }),
});

// 5. Forgot Password & Resend
export const EmailOnlyRequestSchema = z.object({
  body: z.object({
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
  }),
});

// 6. Reset Password
export const ResetPasswordRequestSchema = z.object({
  body: z.object({
    token: z.string().min(1, ErrorAuthCodes.INVALID_OPAQUE_TOKEN),
    newPassword: z
      .string()
      .min(8, ErrorUserCodes.PASSWORD_TOO_SHORT)
      .regex(/[A-Z]/, ErrorUserCodes.PASSWORD_NEED_UPPERCASE)
      .regex(/[0-9]/, ErrorUserCodes.PASSWORD_NEED_NUMBER)
      .regex(/[^a-zA-Z0-9]/, ErrorUserCodes.PASSWORD_NEED_SPECIAL_CHAR),
  }),
});

// 7. Social Login
export const SocialLoginRequestSchema = z.object({
  params: z.object({
    provider: z
      .string()
      .toUpperCase()
      .refine((val) => Object.values(OauthProvider).includes(val as any), {
        message: ClientErrorCodes.OAUTH_PROVIDER_IS_NOT_SUPPORTED,
      }),
  }),
  body: z.object({
    token: z.string().min(1, ClientErrorCodes.OAUTH_TOKEN_IS_REQUIRED),
  }),
});

// Client-side schemas (without request wrapper)
// Client-side schemas (without request wrapper)
export const loginSchema = z.object({
  email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
  password: z.string().min(1, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
  honey_pot: z.string().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT),
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
    password: z
      .string()
      .min(8, ErrorUserCodes.PASSWORD_TOO_SHORT)
      .regex(/[A-Z]/, ErrorUserCodes.PASSWORD_NEED_UPPERCASE)
      .regex(/[0-9]/, ErrorUserCodes.PASSWORD_NEED_NUMBER)
      .regex(/[^a-zA-Z0-9]/, ErrorUserCodes.PASSWORD_NEED_SPECIAL_CHAR),
    confirmPassword: z
      .string()
      .min(1, ErrorUserCodes.CONFIRM_PASSWORD_IS_REQUIRED),
    honey_pot: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ErrorUserCodes.PASSWORDS_DO_NOT_MATCH,
    path: ['confirmPassword'],
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, ErrorAuthCodes.INVALID_OPAQUE_TOKEN),
    newPassword: z
      .string()
      .min(8, ErrorUserCodes.PASSWORD_TOO_SHORT)
      .regex(/[A-Z]/, ErrorUserCodes.PASSWORD_NEED_UPPERCASE)
      .regex(/[0-9]/, ErrorUserCodes.PASSWORD_NEED_NUMBER)
      .regex(/[^a-zA-Z0-9]/, ErrorUserCodes.PASSWORD_NEED_SPECIAL_CHAR),
    confirmPassword: z
      .string()
      .min(1, ErrorUserCodes.CONFIRM_PASSWORD_IS_REQUIRED),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: ErrorUserCodes.PASSWORDS_DO_NOT_MATCH,
    path: ['confirmPassword'],
  });
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// Input types for services (matching server expected body)
export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};
