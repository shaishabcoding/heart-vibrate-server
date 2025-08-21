import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { OtpServices } from './Otp.service';
import { AuthServices } from '../auth/Auth.service';

export const OtpControllers = {
  resetPasswordOtpSend: catchAsync(async ({ user }, res) => {
    const otp = await OtpServices.send(user, 'reset password');

    serveResponse(res, {
      message: `OTP sent to ${user?.email} successfully!`,
      data: { expiredAt: otp?.exp?.toLocaleTimeString() },
    });
  }),

  resetPasswordOtpVerify: catchAsync(async ({ user, body }, res) => {
    await OtpServices.verify(user.id, body.otp);

    const { reset_token } = AuthServices.retrieveToken(user.id, 'reset_token');

    AuthServices.setTokens(res, { reset_token });

    serveResponse(res, {
      message: 'OTP verified successfully!',
      data: { reset_token },
    });
  }),

  accountVerifyOtpSend: catchAsync(async ({ user }, res) => {
    const otp = await OtpServices.send(user, 'account verify');

    serveResponse(res, {
      message: `OTP sent to ${user?.email} successfully!`,
      data: { expiredAt: otp?.exp?.toLocaleTimeString() },
    });
  }),
};
