import { ErrorRequestHandler, RequestHandler } from 'express';

/**
 * Wraps an Express request handler to catch and handle async errors
 *
 * @param fn - The Express request handler function to wrap
 * @returns A wrapped request handler that catches async errors
 */
const catchAsync =
  (
    fn: RequestHandler<any, any, any, any>,
    errFn: ErrorRequestHandler | null = null,
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (errFn) await errFn(error, req, res, next);
      else next(error);
    }
  };

export default catchAsync;
