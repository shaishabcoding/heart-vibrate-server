/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars, no-console */
import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import colors from 'colors';
import { ZodError } from 'zod';
import config from '../../config';
import ServerError from '../../errors/ServerError';
import handleZodError from '../../errors/handleZodError';
import { errorLogger } from '../../util/logger/logger';
import { TErrorHandler, TErrorMessage } from '../../types/errors.types';
import multer from 'multer';
import handleMulterError from '../../errors/handleMulterError';
import { deleteImage } from './capture';
import { Prisma } from '../../../prisma';
import {
  handlePrismaRequestError,
  handlePrismaValidationError,
} from '../../errors/handlePrismaErrors';

export const defaultError: TErrorHandler = {
  statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  message: 'Something went wrong',
  errorMessages: [],
};

const globalErrorHandler: ErrorRequestHandler = (error, req, res, _) => {
  /** delete uploaded files */
  req.tempFiles?.forEach(deleteImage);

  if (config.server.isDevelopment)
    console.log(colors.red('🚨 globalErrorHandler ~~ '), error);
  else errorLogger.error(colors.red('🚨 globalErrorHandler ~~ '), error);

  const { statusCode, message, errorMessages } = formatError(error);

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.server.isDevelopment && error.stack,
  });
};

export default globalErrorHandler;

const formatError = (error: any): TErrorHandler => {
  if (error instanceof multer.MulterError) return handleMulterError(error);
  if (error instanceof ZodError) return handleZodError(error);
  if (error instanceof Prisma.PrismaClientKnownRequestError)
    return handlePrismaRequestError(error);
  if (error instanceof Prisma.PrismaClientValidationError)
    return handlePrismaValidationError(error);
  if (error instanceof ServerError)
    return {
      statusCode: error.statusCode,
      message: error.message,
      errorMessages: createErrorMessage(error.message),
    };
  if (error instanceof Error)
    return {
      ...defaultError,
      message: error.message,
      errorMessages: createErrorMessage(error.message),
    };

  return defaultError;
};

export const createErrorMessage = (message: string): TErrorMessage[] => [
  { path: '', message },
];
