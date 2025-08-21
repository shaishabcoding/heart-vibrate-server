import { z } from 'zod';
import { EUserRole } from '../../../../prisma';
import { enum_encode } from '../../../util/transform/enum';

const socialSchema = z.object({
  platform: z
    .string({
      required_error: 'Platform is missing',
    })
    .trim()
    .min(1, "Platform can't be empty"),
  link: z
    .string({
      required_error: 'Link is missing',
    })
    .url({
      message: 'Give a valid link',
    }),
  followers: z.coerce.number({
    required_error: 'Followers is missing',
  }),
});

export const UserValidations = {
  create: z.object({
    body: z.object({
      email: z
        .string({
          required_error: 'Email is missing',
        })
        .toLowerCase()
        .email('Give a valid email'),
      password: z
        .string({
          required_error: 'Password is missing',
        })
        .min(6, 'Password must be at least 6 characters long'),
    }),
  }),

  edit: z.object({
    body: z.object({
      name: z.string().optional(),
      avatar: z.string().optional(),
      phone: z.string().optional(),
      fcmToken: z.string().optional(),
      address: z.string().optional(),
      socials: z.array(socialSchema).optional(),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      oldPassword: z
        .string({
          required_error: 'Old Password is missing',
        })
        .min(1, 'Old Password is required')
        .min(6, 'Old Password must be at least 6 characters long'),
      newPassword: z
        .string({
          required_error: 'New Password is missing',
        })
        .min(1, 'New Password is required')
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
        .pipe(z.nativeEnum(EUserRole).optional()),
    }),
  }),

  requestForInfluencer: z.object({
    body: z.object({
      avatar: z.string().optional(),
      address: z
        .string({
          required_error: 'Address is missing',
        })
        .trim()
        .min(1, "Address can't be empty"),
      ...socialSchema.shape,
    }),
  }),
};
