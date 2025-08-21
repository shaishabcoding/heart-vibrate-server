import rateLimit from 'express-rate-limit';
import ms from 'ms';
import config from '../../../config';

export const otpLimiter = rateLimit({
  windowMs: ms(config.otp.window),
  limit: config.otp.limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
