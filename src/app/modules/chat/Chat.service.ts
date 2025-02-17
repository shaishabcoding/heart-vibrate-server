import { Request } from 'express';
import Chat from './Chat.model';
import User from '../user/User.model';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import Message from '../message/Message.model';

export const ChatService = {
  async resolve(req: Request) {
    const { target, name, image } = req.body;
    const userId = req.user._id;

    if (!target || !Array.isArray(target) || target.length === 0)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Target users required');

    const existingUsers = await User.find({ _id: { $in: target } });

    if (existingUsers.length !== target.length)
      throw new ServerError(
        StatusCodes.NOT_FOUND,
        'One or more users do not exist',
      );

    if (target.length === 1) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        users: { $all: [userId, target[0]] },
      });

      if (existingChat) return existingChat;

      const newChat = await Chat.create({
        users: [userId, target[0]],
      });

      return newChat;
    } else {
      if (!name || !image)
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          'Group chat requires name and image',
        );

      const newGroupChat = await Chat.create({
        name,
        image,
        users: [userId, ...target],
        admins: [userId],
        isGroup: true,
      });

      return newGroupChat;
    }
  },

  async retrieve(userId: Types.ObjectId) {
    return await Chat.find({ users: { $in: [userId] } })
      .populate({
        path: 'users',
        select: 'name avatar _id',
      })
      .populate({
        path: 'admins',
        select: 'name avatar _id',
      });
  },

  async pop(chatId: string, userId: Types.ObjectId) {
    const chat = await Chat.findById(chatId);

    if (!chat) throw new ServerError(StatusCodes.NOT_FOUND, 'Chat not found');

    chat.users = chat.users.filter(id => !id.equals(userId));

    if (chat.users.length < 2) {
      await Chat.findByIdAndDelete(chatId);
      await Message.deleteMany({ chat: chatId });
    } else await chat.save();
  },
};
