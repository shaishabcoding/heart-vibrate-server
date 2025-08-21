import morgan from 'morgan';
import config from '../../config';
import { errorLogger, logger } from './logger';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';

morgan.token('message', (_, res: Response) => res?.locals.errorMessage ?? '');

const getIpFormat = () =>
  config.server.isDevelopment ? ':remote-addr - ' : '';
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;

/**
 * Success handler for Morgan logging
 *
 * This function configures the Morgan logging middleware to log successful requests.
 * It skips requests with status codes greater than or equal to 400 and logs the request details to the console.
 */
const successHandler = morgan(successResponseFormat, {
  skip: (_, { statusCode }) => statusCode >= StatusCodes.BAD_REQUEST,
  stream: { write: (message: string) => logger.info(message.trim()) },
});

/**
 * Error handler for Morgan logging
 *
 * This function configures the Morgan logging middleware to log error requests.
 * It logs requests with status codes less than 400 to the error logger.
 */
const errorHandler = morgan(errorResponseFormat, {
  skip: (_, { statusCode }) => statusCode < StatusCodes.BAD_REQUEST,
  stream: { write: (message: string) => errorLogger.error(message.trim()) },
});

export const Morgan = { errorHandler, successHandler };
