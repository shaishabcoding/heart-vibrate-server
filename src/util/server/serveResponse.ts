import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export type TPagination = {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
};

type TServeResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: Record<string, unknown> & { pagination?: TPagination };
  data?: T;
};

/**
 * Sends a standardized API response with consistent formatting
 * including success status, message, metadata and optional data payload
 */
const serveResponse = <T>(
  res: Response,
  {
    statusCode = StatusCodes.OK,
    success = true,
    message = 'Success',
    meta,
    data,
  }: Partial<TServeResponse<T>> = {},
) => res.status(statusCode).json({ success, statusCode, message, meta, data });

export default serveResponse;
