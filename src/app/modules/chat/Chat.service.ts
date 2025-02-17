import { Request } from 'express';
import Chat from './Chat.model';
import User from '../user/User.model';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import Message from '../message/Message.model';
import deleteFile from '../../../shared/deleteFile';

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

    // Remove the user from the chat
    chat.users = chat.users.filter(id => !id.equals(userId));

    // If the chat has fewer than 2 users after removal, delete it
    if (chat.users.length < 2) {
      if (chat.image) await deleteFile(chat.image); // Delete the associated chat image

      await Chat.findByIdAndDelete(chatId);
      await Message.deleteMany({ chat: chatId });
      return;
    }

    // If it's a group chat, check if the user is the only admin
    if (chat.isGroup) {
      const isAdmin = chat.admins.some(id => id.equals(userId));

      if (isAdmin) {
        // Remove the user from the admin list
        chat.admins = chat.admins.filter(id => !id.equals(userId));

        // If no other admins remain, assign a new one
        if (chat.admins.length === 0 && chat.users.length > 0) {
          chat.admins.push(chat.users[0]); // Assign the first user as the new admin
        }
      }
    }

    await chat.save();
  },
};
