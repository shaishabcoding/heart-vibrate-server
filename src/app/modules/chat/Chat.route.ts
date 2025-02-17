import { Router } from 'express';
import { ChatController } from './Chat.controller';
import auth from '../../middlewares/auth';
import imageUploader from '../../middlewares/imageUploader';
import purifyRequest from '../../middlewares/purifyRequest';
import { ChatValidation } from './Chat.validation';

const router = Router();

router.use(auth('ADMIN', 'USER'));

router.get('/', ChatController.retrieve);

router.post(
  '/resolve',
  imageUploader((req, images) => {
    req.body.image = images[0];
  }, true),
  purifyRequest(ChatValidation.resolve),
  ChatController.resolve,
);

router.delete('/:chatId/delete', ChatController.pop);

export const ChatRoutes = router;
