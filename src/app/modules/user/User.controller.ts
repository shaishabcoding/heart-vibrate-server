import { RequestHandler } from 'express';
import { UserServices } from './User.service';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { TUser } from './User.interface';
import catchAsync from '../../../shared/catchAsync';
import config from '../../../config';
import sendResponse from '../../../shared/sendResponse';

const createUser: RequestHandler = catchAsync(async ({ body }, res) => {
  const { firstName, lastName, gender, email, password, avatar } = body;

  const userData: Partial<TUser> = {
    name: { firstName, lastName },
    gender,
    email,
    password,
    avatar,
  };

  await UserServices.createUser(userData);
  const { accessToken, refreshToken, user } = await AuthServices.loginUser({
    email: body.email,
    password: body.password,
  });

  res.cookie('refreshToken', refreshToken, {
    secure: config.node_env !== 'development',
    httpOnly: true,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'User created successfully!',
    data: { token: accessToken, user },
  });
});

const getAllUser: RequestHandler = catchAsync(async (req, res) => {
  const usersWithMeta = await UserServices.getAllUser(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users are retrieved successfully!',
    data: usersWithMeta,
  });
});

const userList: RequestHandler = catchAsync(async (req, res) => {
  const users = await UserServices.userList(req.query.name as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users are retrieved successfully!',
    data: users,
  });
});

export const UserControllers = {
  createUser,
  getAllUser,
  userList,
};
