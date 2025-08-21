import { UserServices } from './User.service';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { OtpServices } from '../otp/Otp.service';
import { errorLogger } from '../../../util/logger/logger';
import prisma from '../../../util/prisma';
import { User as TUser } from '../../../../prisma';

export const UserControllers = {
  createUser: catchAsync(async ({ body }, res) => {
    const user = (await UserServices.create(body)) as TUser;
    let otp = null;

    try {
      otp = await OtpServices.send(user, 'account verify');
    } catch (error) {
      errorLogger.error(error);
    }

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: `${user.role.toCapitalize() ?? 'User'} registered successfully!`,
      data: {
        access_token,
        user,
        otp: { expiredAt: otp?.exp?.toLocaleTimeString() },
      },
    });
  }),

  edit: catchAsync(async (req, res) => {
    const data = await UserServices.updateUser(req);

    serveResponse(res, { message: 'Profile updated successfully!', data });
  }),

  superEdit: catchAsync(async ({ params, body }, res) => {
    const user = (await prisma.user.findUnique({
      where: { id: params.userId },
    })) as TUser;

    const data = await UserServices.updateUser({ user, body });

    serveResponse(res, {
      message: `${user?.role?.toCapitalize() ?? 'User'} updated successfully!`,
      data,
    });
  }),

  getAllUser: catchAsync(async ({ query }, res) => {
    const { meta, users } = await UserServices.getAllUser(query);

    serveResponse(res, {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    });
  }),

  superGetAllUser: catchAsync(async ({ query }, res) => {
    const { meta, users } = await UserServices.getAllUser(query);

    Object.assign(meta, { users: await UserServices.getUsersCount() });

    serveResponse(res, {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    });
  }),

  profile: catchAsync(({ user }, res) => {
    serveResponse(res, {
      message: 'Profile retrieved successfully!',
      data: user,
    });
  }),

  superDelete: catchAsync(async ({ params }, res) => {
    const user = await UserServices.delete(params.userId);

    serveResponse(res, {
      message: `${user?.name ?? 'User'} deleted successfully!`,
    });
  }),
};
