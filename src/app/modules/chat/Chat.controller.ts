import catchAsync, { catchAsyncWithCallback } from '../../../shared/catchAsync';
import serveResponse from '../../../shared/serveResponse';
import { imagesUploadRollback } from '../../middlewares/imageUploader';
import { ChatService } from './Chat.service';

export const ChatController = {
  resolve: catchAsyncWithCallback(async (req, res) => {
    const room = await ChatService.resolve(req);

    serveResponse(res, {
      message: 'Room resolve successfully.',
      data: room,
    });
  }, imagesUploadRollback),

  list: catchAsync(async (req, res) => {
    const chats = await ChatService.list(req.user._id!);

    serveResponse(res, {
      message: 'Chats retrieve successfully.',
      data: chats,
    });
  }),

  retrieve: catchAsync(async (req, res) => {
    const chats = await ChatService.retrieve(req.user._id!, req.params.chatId);

    serveResponse(res, {
      message: 'Chat retrieve successfully.',
      data: chats,
    });
  }),

  pop: catchAsync(async (req, res) => {
    await ChatService.pop(req.params.chatId, req.user._id!);

    serveResponse(res, {
      message: 'Chat deleted successfully.',
    });
  }),
};
