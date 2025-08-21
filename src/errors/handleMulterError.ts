import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { createErrorMessage } from '../app/middlewares/globalErrorHandler';

const handleMulterError = ({ code, message }: multer.MulterError) => {
  return {
    statusCode: StatusCodes.BAD_REQUEST,
    message:
      (
        {
          LIMIT_FIELD_COUNT: 'Too many fields in the form.',
          LIMIT_UNEXPECTED_FILE: 'Unexpected field in the form.',
        } as Record<string, string>
      )[code] ?? 'Invalid form data.',
    errorMessages: createErrorMessage(message),
  };
};

export default handleMulterError;
