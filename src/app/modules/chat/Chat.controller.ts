import { catchAsyncWithCallback } from '../../../shared/catchAsync';
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
};
