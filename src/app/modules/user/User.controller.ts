import { UserServices } from './User.service';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { OtpServices } from '../otp/Otp.service';
import { errorLogger } from '../../../util/logger/logger';
import { EUserRole, User as TUser } from '../../../../prisma';
import prisma from '../../../util/prisma';

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

  createSubAdmin: catchAsync(async ({ body }, res) => {
    const user = (await UserServices.create({
      ...body,
      role: EUserRole.SUB_ADMIN,
    })) as TUser;

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: `${user.role.toCapitalize() ?? 'User'} registered successfully!`,
      data: user,
    });
  }),

  edit: catchAsync(async (req, res) => {
    const data = await UserServices.updateUser(req);

    serveResponse(res, {
      message: 'Profile updated successfully!',
      data,
    });
  }),

  superEdit: catchAsync(async ({ params, body }, res) => {
    const user = (await prisma.user.findUnique({
      where: { id: params.userId },
    })) as TUser;

    const data = await UserServices.updateUser({
      user,
      body,
    });

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

    Object.assign(meta, {
      users: await UserServices.getUsersCount(),
    });

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

  delete: catchAsync(async ({ params }, res) => {
    const user = await UserServices.delete(params.userId);

    serveResponse(res, {
      message: `${user?.name ?? 'User'} deleted successfully!`,
    });
  }),

  requestForInfluencer: catchAsync(async ({ body, user }, res) => {
    const { avatar, address, followers, link, platform } = body;

    const data = await UserServices.updateUser({
      user,
      body: {
        avatar,
        address,
        socials: [
          {
            followers,
            link,
            platform,
          },
        ],
      },
    });

    serveResponse(res, {
      message: 'Request sent successfully!',
      data,
    });
  }),

  getPendingInfluencers: catchAsync(async ({ query }, res) => {
    const { meta, influencers } =
      await UserServices.getPendingInfluencers(query);

    serveResponse(res, {
      message: 'Influencers retrieved successfully!',
      meta,
      data: influencers,
    });
  }),

  approveInfluencer: catchAsync(async ({ params }, res) => {
    const data = await UserServices.updateUser({
      user: { id: params.influencerId },
      body: { role: EUserRole.INFLUENCER },
    });

    serveResponse(res, {
      message: 'Influencer accepted successfully!',
      data,
    });
  }),

  declineInfluencer: catchAsync(async ({ params }, res) => {
    const data = await UserServices.updateUser({
      user: { id: params.influencerId },
      body: {
        socials: [],
        role: EUserRole.USER,
      },
    });

    serveResponse(res, {
      message: 'Influencer declined successfully!',
      data,
    });
  }),
};
