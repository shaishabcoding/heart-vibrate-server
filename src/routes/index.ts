import { Router } from 'express';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { ChatRoutes } from '../app/modules/chat/Chat.route';
import { MessageRoutes } from '../app/modules/message/Message.route';

const router = Router();

const apiRoutes: { path: string; route: Router }[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/chat',
    route: ChatRoutes,
  },
  {
    path: '/message',
    route: MessageRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
