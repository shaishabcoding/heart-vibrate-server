import express from 'express';
import { AuthController } from './Auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './Auth.validation';
import auth from '../../middlewares/auth';
import { UserControllers } from '../user/User.controller';
import { UserValidation } from '../user/User.validation';
import imageUploader from '../../middlewares/imageUploader';
import purifyRequest from '../../middlewares/purifyRequest';

const router = express.Router();

router.post(
  '/register',
  imageUploader((req, images) => {
    req.body.avatar = images[0];
  }),
  purifyRequest(UserValidation.userValidationSchema),
  UserControllers.createUser,
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

router.post('/logout', auth('USER'), AuthController.logout);

router.patch(
  '/change-password',
  auth('USER'),
  validateRequest(AuthValidation.passwordChangeValidationSchema),
  AuthController.changePassword,
);

router.post('/forget-password', auth('USER'), AuthController.forgetPassword);

router.post('/reset-password', auth('USER'), AuthController.resetPassword);

/**
 * generate new access token
 */
router.get(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken,
);

export const AuthRoutes = router;
