import { Router } from 'express';
import { UserRoutes } from '../user/User.route';

export default Router().inject([{ path: '/users', route: UserRoutes.admin }]);
