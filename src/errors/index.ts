import { StatusCodes } from 'http-status-codes';
import ServerError from './ServerError';

export const notFoundError = (url: string) =>
  new ServerError(StatusCodes.NOT_FOUND, `Route not found. ${url}`);
