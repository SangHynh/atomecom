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

// Update user validation (Admin/General)
export const UpdateUserRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, ErrorUserCodes.INVALID_NAME_FORMAT).optional(),
    email: z.string().email(ErrorUserCodes.INVALID_EMAIL_FORMAT).optional(),
    phone: z.string().min(10, ErrorUserCodes.INVALID_PHONE_FORMAT).optional(),
    role: z.nativeEnum(USER_ROLE).optional(),
    status: z.nativeEnum(USER_STATUS).optional(),
    isVerified: z.boolean().optional(),
    password: z
      .string()
      .min(6, ErrorUserCodes.INVALID_PASSWORD_FORMAT)
      .optional(),
    addresses: z.array(UserAddressSchema).optional(),
  }),
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
