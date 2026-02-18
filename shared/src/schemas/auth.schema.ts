import { z } from 'zod';
import { ErrorAuthCodes, ErrorUserCodes } from '../constants/error.constants.js';
import { OauthProvider } from '../enums/oauthProvider.enum.js';

// 1. Register
export const RegisterRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT),
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
    password: z.string().min(6, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
    phone: z.string().min(10, ErrorUserCodes.INVALID_PHONE_FORMAT).optional(),
  }),
});

// 2. Login
export const LoginRequestSchema = z.object({
  body: z.object({
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
    password: z.string().min(1, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
  }),
});

// 3. Refresh Token & Logout
export const TokenRequestSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, ErrorAuthCodes.INVALID_REFRESH_TOKEN),
  }),
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
    newPassword: z.string().min(6, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
  }),
});

// 7. Social Login
export const SocialLoginRequestSchema = z.object({
  params: z.object({
    provider: z
      .string()
      .toUpperCase()
      .refine((val) => Object.values(OauthProvider).includes(val as any), {
        message: 'OAUTH_PROVIDER_IS_NOT_SUPPORTED',
      }),
  }),
  body: z.object({
    token: z.string().min(1, 'OAUTH_TOKEN_IS_REQUIRED'),
  }),
});

// Client-side schemas (without request wrapper)
export const loginSchema = z.object({
  email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
  password: z.string().min(1, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
});

export const registerSchema = z.object({
  name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT),
  email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
  password: z.string().min(6, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
