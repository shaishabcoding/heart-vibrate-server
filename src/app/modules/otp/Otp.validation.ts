import { z } from 'zod';
import config from '../../../config';

export const OtpValidations = {
  email: z.object({
    body: z.object({
      email: z
        .string({ required_error: 'Email is missing' })
        .toLowerCase()
        .email('Give a valid email'),
    }),
  }),

  otp: z.object({
    body: z.object({
      otp: z
        .string({ required_error: 'OTP is missing' })
        .min(config.otp.length, 'Give a valid OTP')
        .max(config.otp.length, 'Give a valid OTP'),
    }),
  }),
};
