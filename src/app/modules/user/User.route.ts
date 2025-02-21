import { Router } from 'express';
import { UserControllers } from './User.controller';

const router = Router();

router.get('/', UserControllers.userList);

export const UserRoutes = router;
