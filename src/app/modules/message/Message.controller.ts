import serveResponse from '../../../util/server/serveResponse';
import catchAsync from '../../middlewares/catchAsync';
import { MessageServices } from './Message.service';

export const MessageControllers = {
  retrieveAll: catchAsync(async ({ user, params, query }, res) => {
    const { messages, meta } = await MessageServices.retrieveAll({
      ...query,
      chatId: params.chatId,
      userId: user.id,
    });

    serveResponse(res, {
      message: 'Messages retrieved successfully!',
      meta,
      data: messages,
    });
  }),
};
