import catchAsync from '../../../shared/catchAsync';
import serveResponse from '../../../shared/serveResponse';
import { ChatService } from './Chat.service';

export const ChatController = {
  resolve: catchAsync(async (req, res) => {
    const room = await ChatService.resolve(req);

    serveResponse(res, {
      message: 'Room resolve successfully.',
      data: room,
    });
  }),
};
