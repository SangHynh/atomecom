import { z } from 'zod';
import { USER_ROLE } from '@enum/userRole.enum.js';

const UserAddressSchema = z.object({
  street: z.string().min(1, "STREET_IS_REQUIRED"),
  city: z.string().min(1, "CITY_IS_REQUIRED"),
  phone: z.string().min(10, "PHONE_NUMBER_MUST_BE_AT_LEAST_10_DIGITS"),
  isDefault: z.boolean().default(false),
});


// Create user validation
export const CreateUserRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, "NAME_MUST_BE_AT_LEAST_2_CHARS"),
    email: z.string().email("INVALID_EMAIL_FORMAT"),
    password: z.string().min(6, "PASSWORD_MUST_BE_AT_LEAST_6_CHARS"),
    role: z.nativeEnum(USER_ROLE).optional().default(USER_ROLE.USER),
    addresses: z.array(UserAddressSchema).optional().default([]),
  })
});

// Update user  validation
export const UpdateUserRequestSchema = z.object({
  body: CreateUserRequestSchema.shape.body.partial()
});
