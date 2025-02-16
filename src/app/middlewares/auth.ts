import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelper } from '../../helpers/jwtHelper';
import User from '../modules/user/User.model';
import ServerError from '../../errors/ServerError';

const auth =
  (...roles: ('USER' | 'ADMIN')[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
        const token = tokenWithBearer.split(' ')[1];

        //verify token
        const { email } = jwtHelper.verifyToken(
          token,
          config.jwt.jwt_secret as Secret,
        );

        const user = await User.findOne({ email });

        if (!user)
          throw new ServerError(StatusCodes.UNAUTHORIZED, 'Invalid user');

        //set user to header
        req.user = user;

        //guard user
        if (roles.length && !roles.includes(user.role)) {
          throw new ApiError(
            StatusCodes.FORBIDDEN,
            "You don't have permission to access this api",
          );
        }

        next();
      }
    } catch (error) {
      next(error);
    }
  };

export default auth;
