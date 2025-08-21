/* eslint-disable no-unused-vars */
import { encodeToken, TToken, verifyPassword } from './Auth.utils';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import config from '../../../config';
import { Response } from 'express';
import ms from 'ms';
import prisma from '../../../util/prisma';
import { Prisma } from '../../../../prisma';

export const AuthServices = {
  async getAuth(userId: string, password: string) {
    const auth = await prisma.auth.findFirst({
      where: { user: { id: userId } },
    });

    if (!auth || !(await verifyPassword(password, auth.password)))
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your credentials are incorrect.',
      );

    return auth;
  },

  setTokens(res: Response, tokens: { [key in TToken]?: string }) {
    Object.entries(tokens).forEach(([key, value]) =>
      res.cookie(key, value, {
        httpOnly: true,
        secure: !config.server.isDevelopment,
        maxAge: ms(config.jwt[key as TToken].expire_in),
      }),
    );
  },

  destroyTokens<T extends readonly TToken[]>(res: Response, ...cookies: T) {
    for (const cookie of cookies)
      res.clearCookie(cookie, {
        httpOnly: true,
        secure: !config.server.isDevelopment,
        maxAge: 0, // expire immediately
      });
  },

  /** this function returns an object of tokens
   * e.g. retrieveToken(userId, 'access_token', 'refresh_token');
   * returns { access_token, refresh_token }
   */
  retrieveToken<T extends readonly TToken[]>(uid: string, ...token_types: T) {
    return Object.fromEntries(
      token_types.map(token_type => [
        token_type,
        encodeToken({ uid }, token_type),
      ]),
    ) as Record<T[number], string>;
  },

  async modifyPassword(where: Prisma.AuthWhereUniqueInput, password: string) {
    return prisma.auth.update({
      where,
      data: { password: await password?.hash() },
    });
  },
};
