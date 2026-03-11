import { z } from 'zod';
import { USER_ROLE } from '../enums/userRole.enum.js';
import { USER_STATUS } from '../enums/userStatus.enum.js';
import { ErrorUserCodes } from '../constants/error.constants.js';

export const UserAddressSchema = z.object({
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

// Client-side schemas (without request wrapper)
export const createUserSchema = z.object({
  name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT),
  email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
  phone: z.string().min(10, ErrorUserCodes.INVALID_PHONE_FORMAT).optional(),
  password: z
    .string()
    .min(8, ErrorUserCodes.PASSWORD_TOO_SHORT)
    .regex(/[A-Z]/, ErrorUserCodes.PASSWORD_NEED_UPPERCASE)
    .regex(/[0-9]/, ErrorUserCodes.PASSWORD_NEED_NUMBER)
    .regex(/[^a-zA-Z0-9]/, ErrorUserCodes.PASSWORD_NEED_SPECIAL_CHAR),
  role: z.nativeEnum(USER_ROLE).optional().default(USER_ROLE.USER),
  addresses: z.array(UserAddressSchema).optional().default([]),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

// Create user validation (Server)
export const CreateUserRequestSchema = z.object({
  body: createUserSchema,
});

// Client-side update schema
export const updateUserSchema = z.object({
  name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT).optional(),
  email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT).optional(),
  phone: z.string().min(10, ErrorUserCodes.INVALID_PHONE_FORMAT).optional(),
  role: z.nativeEnum(USER_ROLE).optional(),
  status: z.nativeEnum(USER_STATUS).optional(),
  isVerified: z.boolean().optional(),
  password: z
    .string()
    .min(8, ErrorUserCodes.PASSWORD_TOO_SHORT)
    .regex(/[A-Z]/, ErrorUserCodes.PASSWORD_NEED_UPPERCASE)
    .regex(/[0-9]/, ErrorUserCodes.PASSWORD_NEED_NUMBER)
    .regex(/[^a-zA-Z0-9]/, ErrorUserCodes.PASSWORD_NEED_SPECIAL_CHAR)
    .optional(),
  addresses: z.array(UserAddressSchema).optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

// Update user validation (Admin/General)
export const UpdateUserRequestSchema = z.object({
  body: updateUserSchema,
});

// Update profile validation (for "Me")
export const UpdateProfileRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT).optional(),
    avatar: z.string().url().optional(),
    addresses: z.array(UserAddressSchema).optional(),
  }),
});

// Change password validation
export const ChangePasswordRequestSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6, ErrorUserCodes.INVALID_PASSWORD_FORMAT),
  }),
});

// Change email validation
export const ChangeEmailRequestSchema = z.object({
  body: z.object({
    newEmail: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT),
  }),
});

// Change phone validation
export const ChangePhoneRequestSchema = z.object({
  body: z.object({
    newPhone: z.string().min(10, ErrorUserCodes.INVALID_PHONE_FORMAT),
  }),
});
