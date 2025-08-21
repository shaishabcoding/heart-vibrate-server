/* eslint-disable no-unused-vars */
import type { Request } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from './catchAsync';
import config from '../../config';

const keys = ['body', 'query', 'params', 'cookies'] as const;

type SchemaOrFn =
  | AnyZodObject
  | ((req: Request) => AnyZodObject | Promise<AnyZodObject>);

/**
 * Middleware to validate and sanitize incoming Express requests using Zod schemas.
 *
 * Supports static and dynamic schemas (functions returning schemas).
 * Validates body, query, params, and cookies, then merges results into `req`.
 */
const purifyRequest = (...schemas: SchemaOrFn[]) =>
  catchAsync(
    async (req, _, next) => {
      const results = await Promise.all(
        schemas.map(async schema => {
          const zodSchema =
            typeof schema === 'function' ? await schema(req) : schema;
          return zodSchema.parseAsync(req);
        }),
      );

      keys.forEach(key => {
        req[key] = Object.assign(
          {},
          key === 'params' && req.params,
          ...results.map(result => result?.[key] ?? {}),
        );
      });

      next();
    },
    (error, req, _, next) => {
      if (config.server.isDevelopment)
        keys.forEach(key => console.log(`${key} :`, req[key]));

      next(error);
    },
  );

export default purifyRequest;
