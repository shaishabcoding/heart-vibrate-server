import { ZodError } from 'zod';
import { TErrorMessage } from '../types/errors.types';
import { StatusCodes } from 'http-status-codes';

const handleZodError = ({ issues }: ZodError) => {
  const errorMessages: TErrorMessage[] = issues.map(({ path, message }) => ({
    path: path[path.length - 1].toString(),
    message,
  }));

  return {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Request validation error',
    errorMessages,
  };
};

export default handleZodError;
