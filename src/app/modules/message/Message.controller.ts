import catchAsync from '../../../shared/catchAsync';
import serveResponse from '../../../shared/serveResponse';
import { MessageService } from './Message.serviece';

export const MessageController = {
  retrieve: catchAsync(async (req, res) => {
    const messages = await MessageService.retrieve(
      req.user._id!,
      req.query.chatId as string,
    );

    serveResponse(res, {
      message: 'Message retrieve Successfully.',
      data: messages,
    });
  }),
};
