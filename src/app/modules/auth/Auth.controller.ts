import { RequestHandler } from 'express';
import { AuthServices } from './Auth.service';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import config from '../../../config';
import sendResponse from '../../../shared/sendResponse';

const login: RequestHandler = catchAsync(async (req, res) => {
  const { body } = req;
  const { accessToken, refreshToken, user } =
    await AuthServices.loginUser(body);

  res.cookie('refreshToken', refreshToken, {
    secure: config.node_env !== 'development',
    httpOnly: true,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Login successfully!',
    data: { token: accessToken, user },
  });
});

const logout: RequestHandler = catchAsync(async (_req, res) => {
  res.cookie('refreshToken', '', {
    secure: process.env.NODE_ENV !== 'development',
    httpOnly: true,
    expires: new Date(0), // remove refreshToken
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Logged out successfully',
  });
});

const changePassword: RequestHandler = catchAsync(async (req, res) => {
  await AuthServices.changePassword(req.user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Password has changed successfully!',
    data: null,
  });
});

const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  console.log(req.cookies);
  // const result = await AuthServices.refreshToken(req.cookies.refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'New Access create successfully!',
    // data: result,
  });
});

const forgetPassword: RequestHandler = catchAsync(async (req, res) => {
  await AuthServices.forgetPassword(req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Password reset link sent successfully!',
    data: null,
  });
});

const resetPassword: RequestHandler = catchAsync(async (req, res) => {
  await AuthServices.forgetPassword(req.user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Password reset link sent successfully!',
    data: null,
  });
});

export const AuthController = {
  login,
  logout,
  changePassword,
  forgetPassword,
  resetPassword,
  refreshToken,
};
