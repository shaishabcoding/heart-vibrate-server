import { Types } from 'mongoose';
import { IMessage } from './Message.interface';
import Message from './Message.model';
import Chat from '../chat/Chat.model';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';

export const MessageService = {
  async create(messageData: IMessage) {
    return await Message.create(messageData);
  },

  async retrieve(userId: Types.ObjectId, chatId: string) {
    const chat = await Chat.findById(chatId).select('users');

    if (!chat) throw new ServerError(StatusCodes.NOT_FOUND, 'Chat not found');

    if (!chat.users.includes(userId))
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'User is not a participant in this chat',
      );

    return await Message.aggregate([
      { $match: { chat: new Types.ObjectId(chatId) } },
      {
        $addFields: {
          date: { $ifNull: ['$updatedAt', '$createdAt'] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender',
        },
      },
      { $unwind: '$sender' },
      { $project: { 'sender.password': 0 } },
      {
        $lookup: {
          from: 'users',
          localField: 'readBy',
          foreignField: '_id',
          as: 'readBy',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'likedBy',
          foreignField: '_id',
          as: 'likedBy',
        },
      },
      {
        $project: {
          // chat: 0,
          sender: { name: 1, avatar: 1, _id: 1 },
          readBy: { name: 1, avatar: 1, _id: 1 },
          likedBy: { name: 1, avatar: 1, _id: 1 },
          date: 1,
          message: 1,
        },
      },
    ]);
  },
};
