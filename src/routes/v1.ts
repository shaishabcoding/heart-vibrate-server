import { Router } from 'express';
import auth from '../app/middlewares/auth';
import AdminRoutes from '../app/modules/admin/Admin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { StatusCodes } from 'http-status-codes';

const appRouter = Router();

/** Forward uploaded files requests */
['images'].map((filetype: string) =>
  appRouter.get(`/${filetype}/:filename`, (req, res) =>
    res.redirect(
      StatusCodes.MOVED_PERMANENTLY,
      `/${filetype}/${encodeURIComponent(req.params.filename)}`,
    ),
  ),
);

export default appRouter.inject([
  { path: '/auth', route: AuthRoutes },
  { path: '/profile', route: UserRoutes.user },
  { path: '/admin', middlewares: [auth.admin()], route: AdminRoutes },
]);
