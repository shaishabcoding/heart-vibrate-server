import { z } from 'zod';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';

export const ChatValidation = {
  resolve: z.object({
    body: z.object({
      name: z.string().optional(),
      target: z.string().transform(val => {
        try {
          const parsed = JSON.parse(val);
          if (
            !Array.isArray(parsed) ||
            !parsed.every(id => typeof id === 'string')
          )
            throw new ServerError(
              StatusCodes.BAD_REQUEST,
              'Invalid Target value.',
            );

          return parsed;
        } catch {
          throw new ServerError(
            StatusCodes.BAD_REQUEST,
            'Target must be a valid JSON stringified array of ObjectIds',
          );
        }
      }),
      image: z.string().optional(),
    }),
  }),
};
