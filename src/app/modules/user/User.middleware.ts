import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import catchAsync from '../../middlewares/catchAsync';
import prisma from '../../../util/prisma';

export const UserMiddlewares = {
  useUser: (key = 'email') =>
    catchAsync(async (req, _, next) => {
      const user = await prisma.user.findFirst({
        where: { [key]: req.body[key] },
      });

      if (!user)
        next(
          new ServerError(
            StatusCodes.UNAUTHORIZED,
            'Your credentials are incorrect.',
          ),
        );
      else req.user = user as any;

      next();
    }),
};
