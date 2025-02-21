import { Router } from 'express';
import auth from '../../middlewares/auth';
import { MessageController } from './Message.controller';

const router = Router();
router.use(auth('ADMIN', 'USER'));

router.get('/', MessageController.retrieve);

export const MessageRoutes = router;
