import { z } from 'zod';
import { EUserRole } from '../../../../prisma';
import { enum_encode } from '../../../util/transform/enum';

export const UserValidations = {
  create: z.object({
    body: z.object({
      email: z.email('Give a valid email'),
      password: z
        .string({ error: 'Password is missing' })
        .min(6, 'Password must be at least 6 characters long'),
    }),
  }),

  edit: z.object({
    body: z.object({
      name: z.string().optional(),
      avatar: z.string().optional(),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      //! Don't use length validation for old password
      oldPassword: z
        .string({ error: 'Old Password is missing' })
        .min(1, 'Old Password is missing'),
      newPassword: z
        .string({ error: 'New Password is missing' })
        .min(6, 'New Password must be at least 6 characters long'),
    }),
  }),

  getAllUser: z.object({
    query: z.object({
      search: z.string().trim().optional(),
      role: z
        .string()
        .optional()
        .transform(enum_encode)
        .pipe(z.enum(EUserRole).optional()),
    }),
  }),
};
