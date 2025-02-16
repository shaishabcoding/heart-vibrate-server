import { z } from 'zod';

const passwordChangeValidationSchema = z.object({
  body: z.object({
    oldPassword: z
      .string()
      .min(1, 'Old Password is required')
      .min(6, 'Old Password must be at least 6 characters long'),
    newPassword: z
      .string()
      .min(1, 'New Password is required')
      .min(6, 'New Password must be at least 6 characters long'),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'refreshToken is missing',
    }),
  }),
});

export type TPasswordChange = z.infer<
  typeof passwordChangeValidationSchema.shape.body
>;

export const AuthValidation = {
  passwordChangeValidationSchema,
  refreshTokenValidationSchema,
};
