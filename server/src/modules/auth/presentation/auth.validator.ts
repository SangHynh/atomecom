import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'NAME_MUST_BE_AT_LEAST_2_CHARS'),
    email: z.string().email('INVALID_EMAIL_FORMAT'),
    password: z.string().min(6, 'PASSWORD_MUST_BE_AT_LEAST_6_CHARS'),
    phone: z.string().min(10, 'PHONE_NUMBER_MUST_BE_AT_LEAST_10_DIGITS').optional(),
    // default role is user
  }),
});