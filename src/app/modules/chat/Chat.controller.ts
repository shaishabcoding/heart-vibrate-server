import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { ChatServices } from './Chat.service';

export const ChatControllers = {
  join: catchAsync(async ({ user, body }, res) => {
    const data = await ChatServices.join({ ...body, userId: user.id });

    serveResponse(res, { message: 'Chat resolved successfully!', data });
  }),

  edit: catchAsync(async ({ user, body, params }, res) => {
    const data = await ChatServices.edit({
      ...body,
      chatId: params.chatId,
      userId: user.id,
    });

    serveResponse(res, { message: 'Chat updated successfully!', data });
  }),

  delete: catchAsync(async ({ user, params }, res) => {
    await ChatServices.delete({ chatId: params.chatId, userId: user.id });

    serveResponse(res, { message: 'Chat deleted successfully!' });
  }),
};
