import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

/**
 * Wrapper for async request handlers with standard error handling.
 */
const catchAsync =
  (fn: RequestHandler): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default catchAsync;

/**
 * Wrapper for async request handlers with a custom error callback.
 * If an error occurs, the callback is invoked before passing the error to `next()`.
 */
/**
 * Wrapper for async request handlers with a custom error handler.
 * If an error occurs, the provided error handler is invoked before passing the error to `next()`.
 */
export const catchAsyncWithCallback =
  (
    fn: RequestHandler,
    errorHandler?: ErrorRequestHandler, // Use Express's ErrorRequestHandler type
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error, req, res, next); // Invoke the provided error handler
      } else {
        next(error); // Pass the error to the default error handler
      }
    }
  };
