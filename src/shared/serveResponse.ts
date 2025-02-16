import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

type Pagination = {
  page: number;
  limit: number;
  totalPage: number;
  total: number;
};

type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: Record<string, unknown> & { pagination?: Pagination };
  data?: T;
};

/**
 * Sends a standardized JSON response.
 *
 * @template T - The type of the response data.
 * @param {Response} res - The Express response object.
 * @param {Object} [options] - Optional parameters for the response.
 * @param {number} [options.statusCode=StatusCodes.OK] - The HTTP status code for the response.
 * @param {boolean} [options.success=true] - Indicates whether the request was successful.
 * @param {string} [options.message='Success'] - A message describing the result of the request.
 * @param {Object} [options.meta={}] - Additional metadata to include in the response.
 * @param {T} [options.data] - The data to include in the response.
 * @returns {void}
 */
const serveResponse = <T>(
  res: Response,
  {
    statusCode = StatusCodes.OK,
    success = true,
    message = 'Success',
    meta,
    data,
  }: Partial<ApiResponse<T>> = {},
): void => {
  res.status(statusCode).json({ success, statusCode, message, meta, data });
};

export default serveResponse;
