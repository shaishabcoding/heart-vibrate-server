import { z } from 'zod';
import config from '../../../config';

const otpLength = config.otp.length;

export const OtpValidations = {
  email: z.object({
    body: z.object({
      email: z.email('Give a valid email'),
    }),
  }),

  otp: z.object({
    body: z.object({
      otp: z.coerce
        .string({ error: 'OTP is missing' })
        .min(otpLength, 'OTP must be 6 characters long')
        .max(otpLength, 'OTP must be 6 characters long'),
    }),
  }),
};
