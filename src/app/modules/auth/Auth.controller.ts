import { AuthServices } from './Auth.service';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { OtpServices } from '../otp/Otp.service';
import prisma from '../../../util/prisma';
import { EUserRole } from '../../../../prisma';
import { TToken } from './Auth.utils';

export const AuthControllers = {
  login: catchAsync(async ({ user, body }, res) => {
    await AuthServices.getAuth(user.id, body.password);

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, {
      access_token,
      refresh_token,
    });

    serveResponse(res, {
      message: 'Login successfully!',
      data: { access_token, user },
    });
  }),

  logout: catchAsync(async ({ cookies }, res) => {
    AuthServices.destroyTokens(res, ...(Object.keys(cookies) as TToken[]));

    serveResponse(res, {
      message: 'Logged out successfully!',
    });
  }),

  resetPassword: catchAsync(async ({ body, user }, res) => {
    await AuthServices.modifyPassword({ userId: user.id }, body.password);

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    AuthServices.destroyTokens(res, 'reset_token');
    AuthServices.setTokens(res, { access_token, refresh_token });

    serveResponse(res, {
      message: 'Password reset successfully!',
      data: { access_token, user },
    });
  }),

  refreshToken: catchAsync(async ({ user }, res) => {
    const { access_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
    );

    AuthServices.setTokens(res, { access_token });

    serveResponse(res, {
      message: 'AccessToken refreshed successfully!',
      data: { access_token },
    });
  }),

  changePassword: catchAsync(async ({ user, body }, res) => {
    const { id } = await AuthServices.getAuth(user.id, body.oldPassword);

    await AuthServices.modifyPassword({ id }, body.newPassword);

    serveResponse(res, {
      message: 'Password changed successfully!',
    });
  }),

  verifyAccount: catchAsync(async ({ user, body }, res) => {
    await OtpServices.verify(user.id, body.otp);

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: EUserRole.USER,
      },
    });

    serveResponse(res, {
      message: 'Account verified successfully!',
      data: { user },
    });
  }),
};
