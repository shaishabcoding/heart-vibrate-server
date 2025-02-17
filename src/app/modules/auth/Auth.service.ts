import User from '../user/User.model';
import bcrypt from 'bcrypt';
import { createToken, verifyToken } from './Auth.utils';
import { TUser } from '../user/User.interface';
import { makeResetBody } from './Auth.constant';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { sendEmail } from '../../../helpers/sendMail';
import config from '../../../config';

export const AuthServices = {
  async loginUser({ email, password }: { email: string; password: string }) {
    const user = await User.findOne({
      email,
    }).select('+password');

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Account is not active. Please contact support.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect password!');
    }

    const {
      _id,
      gender,
      name: { firstName, lastName },
      role,
      avatar,
    } = user.toJSON();

    const partialUser: Partial<TUser> = {
      _id,
      email,
      gender,
      name: { firstName, lastName },
      role,
      avatar,
    };

    const jwtPayload = {
      email,
    };

    const accessToken = createToken(jwtPayload, 'access');

    const refreshToken = createToken(jwtPayload, 'refresh');

    return { accessToken, user: partialUser, refreshToken };
  },

  async changePassword(
    user: TUser,
    {
      newPassword,
      oldPassword,
    }: {
      newPassword: string;
      oldPassword: string;
    },
  ) {
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect password!');
    }

    newPassword = await bcrypt.hash(
      newPassword,
      +(config.bcrypt_salt_rounds as string),
    );

    await User.updateOne(
      {
        email: user.email,
      },
      {
        password: newPassword,
      },
    );
  },

  async forgetPassword({ email }: TUser) {
    const jwtPayload = {
      email,
    };

    const resetToken = createToken(jwtPayload, 'reset');

    await sendEmail(email, 'Password Reset Request', makeResetBody(resetToken));
  },

  async resetPassword({ email }: TUser) {
    const jwtPayload = {
      email,
    };

    const resetToken = createToken(jwtPayload, 'reset');

    await sendEmail(email, 'Password Reset Request', makeResetBody(resetToken));
  },

  async refreshToken(token: string) {
    if (!token) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Access Denied!');
    }

    const { email } = verifyToken(token, 'refresh');

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Account is not active. Please contact support.',
      );
    }

    const jwtPayload = {
      email,
    };

    const accessToken = createToken(jwtPayload, 'access');

    return { accessToken };
  },
};
