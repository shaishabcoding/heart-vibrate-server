import { IMessage } from './Message.interface';
import Message from './Message.model';

export const MessageService = {
  async create(messageData: IMessage) {
    return await Message.create(messageData);
  },

  async retrieve(chatId: string) {
    return await Message.find({ chat: chatId })
      .sort('-createdAt')
      .select('-chat')
      .populate({
        path: 'sender',
        select: 'name avatar _id',
      })
      .populate({
        path: 'readBy',
        select: 'name avatar _id',
      })
      .populate({
        path: 'likedBy',
        select: 'name avatar _id',
      });
  },
};
