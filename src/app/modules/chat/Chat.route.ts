import { Router } from 'express';
import { ChatController } from './Chat.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.use(auth('ADMIN', 'USER'));

router.post('/resolve', ChatController.resolve);

export const ChatRoutes = router;
