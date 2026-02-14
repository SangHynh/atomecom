import { z } from 'zod';
import { USER_ROLE } from '@enum/userRole.enum.js';
import { ErrorUserCodes } from '@shared/core/error.enum.js';

const UserAddressSchema = z.object({
  street: z.string().min(1, ErrorUserCodes.INVALID_STREET_FORMAT),
  city: z.string().min(1, ErrorUserCodes.INVALID_CITY_FORMAT),
  isDefault: z.boolean().default(false),
});

// Validate Params for ID
export const FindUserByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, ErrorUserCodes.INVALID_USER_ID),
  }),
});

// Validate Params for Email
export const FindUserByEmailSchema = z.object({
  params: z.object({
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
  }),
});

// Validate Params for Phone
export const FindUserByPhoneSchema = z.object({
  params: z.object({
    phone: z.string().min(10, ErrorUserCodes.INVALID_PHONE_FORMAT),
  }),
});

// Create user validation
export const CreateUserRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT),
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
    phone: z.string().min(10, ErrorUserCodes.INVALID_PHONE_FORMAT).optional(),
    password: z.string().min(6, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
    role: z.nativeEnum(USER_ROLE).optional().default(USER_ROLE.USER),
    addresses: z.array(UserAddressSchema).optional().default([]),
  }),
});

// Update user  validation
export const UpdateUserRequestSchema = z.object({
  body: CreateUserRequestSchema.shape.body.partial(),
});
