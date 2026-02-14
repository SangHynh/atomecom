import { ErrorUserCodes } from '@shared/core/error.enum.js';
import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT),
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
    password: z.string().min(6, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
    phone: z
      .string()
      .min(10, ErrorUserCodes.INVALID_PHONE_FORMAT)
      .optional(),
    // default role is user
  }),
});
