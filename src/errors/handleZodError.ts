import { ZodError } from 'zod';
import { TErrorMessage } from '../types/errors.types';
import { StatusCodes } from 'http-status-codes';

const handleZodError = ({ errors }: ZodError) => {
  const errorMessages: TErrorMessage[] = errors.map(({ path, message }) => ({
    path: path[path.length - 1],
    message,
  }));

  return {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Request validation error',
    errorMessages,
  };
};

export default handleZodError;
