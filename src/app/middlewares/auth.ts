import { StatusCodes } from 'http-status-codes';
import ServerError from '../../errors/ServerError';
import { decodeToken, superRoles, TToken } from '../modules/auth/Auth.utils';
import catchAsync from './catchAsync';
import { EUserRole } from '../../../prisma';
import prisma from '../../util/prisma';
import { enum_decode } from '../../util/transform/enum';

/**
 * Middleware to authenticate and authorize requests based on user roles
 *
 * @param roles - The roles that are allowed to access the resource
 */
const auth = (roles: EUserRole[] = [], token_type: TToken = 'access_token') =>
  catchAsync(async (req, _, next) => {
    const token =
      req.cookies[token_type] ||
      req.headers.authorization ||
      req.query[token_type];

    const id = decodeToken(token, token_type)?.uid;

    if (!id)
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your session has expired. Login again.',
      );

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user)
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Maybe your account has been deleted. Register again.',
      );

    const requiredRoles = Array.from(new Set([...superRoles, ...roles]));

    if (roles.length && !requiredRoles.includes(user.role))
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        user.role === EUserRole.GUEST
          ? `Oh ${user.name}, you were not verified yet! Please verify your email.`
          : `Oh ${user.name}, poor ${enum_decode(user?.role)}! Only the ${requiredRoles.map(enum_decode).join(' or ')} can access ${req.path} route!`,
      );

    req.user = user;

    next();
  });

auth.admin = () => auth([EUserRole.ADMIN]);
auth.subAdmin = () => auth([EUserRole.SUB_ADMIN]);
auth.influencer = () => auth([EUserRole.INFLUENCER]);
auth.user = () => auth([EUserRole.USER]);
auth.notGuest = () => auth(Object.values(EUserRole).excludes(EUserRole.GUEST));
auth.guest = () => auth([EUserRole.GUEST]);

auth.reset = () => auth([], 'reset_token');
auth.refresh = () => auth([], 'refresh_token');

export default auth;
