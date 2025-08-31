import { Router } from 'express';
import { ChatControllers } from './Chat.controller';
import { ChatValidations } from './Chat.validation';
import purifyRequest from '../../middlewares/purifyRequest';
import capture from '../../middlewares/capture';
import { QueryValidations } from '../query/Query.validation';
import { MessageControllers } from '../message/Message.controller';

export const bannerCapture = capture({
  banner: { size: 5 * 1024 * 1024, maxCount: 1, fileType: 'images' },
});

const user = Router();
{
  user.get(
    '/',
    purifyRequest(QueryValidations.list),
    ChatControllers.retrieveAll,
  );

  user.get(
    '/:chatId/messages',
    purifyRequest(
      QueryValidations.exists('chatId', 'chat'),
      QueryValidations.list,
    ),
    MessageControllers.retrieveAll,
  );

  user.post(
    '/join',
    bannerCapture,
    purifyRequest(ChatValidations.join),
    ChatControllers.join,
  );

  user.patch(
    '/:chatId/edit',
    purifyRequest(QueryValidations.exists('chatId', 'chat')),
    bannerCapture,
    purifyRequest(ChatValidations.edit),
    ChatControllers.edit,
  );

  user.delete(
    '/:chatId/delete',
    purifyRequest(QueryValidations.exists('chatId', 'chat')),
    ChatControllers.delete,
  );
}

export const ChatRoutes = { user };
