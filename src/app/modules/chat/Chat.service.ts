import { Request } from 'express';
import Chat from './Chat.model';
import User from '../user/User.model';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import Message from '../message/Message.model';
import deleteFile from '../../../shared/deleteFile';
import { TUser } from '../user/User.interface';

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
    const chats = await Chat.find({ users: { $in: [userId] } })
      .sort('-updatedAt')
      .populate({
        path: 'users',
        select: 'name avatar _id',
      })
      .populate({
        path: 'admins',
        select: 'name avatar _id',
      })
      .lean();

    // Fetch the latest messages for all chats
    const chatIds = chats.map(chat => chat._id);
    const lastMessages = await Message.aggregate([
      { $match: { chat: { $in: chatIds } } },
      { $sort: { createdAt: -1 } }, // Get the newest message first
      { $group: { _id: '$chat', lastMessage: { $first: '$$ROOT' } } }, // Pick the latest per chat
    ]);

    return chats.map((chat: any) => {
      if (!chat.isGroup) {
        // Get the opposite user (the one that is not the requesting user)
        const otherUser = chat.users.find(
          (user: any) => !user._id.equals(userId),
        ) as Partial<TUser>;

        if (otherUser) {
          chat.name = `${otherUser.name?.firstName} ${otherUser.name?.lastName}`;
          chat.image = otherUser.avatar;
        }
      }

      // Find the latest message for this chat
      const lastMessageData = lastMessages.find(
        msg => msg._id.toString() === chat._id.toString(),
      );

      if (lastMessageData) {
        const lastMessage = lastMessageData.lastMessage;
        const isSender = lastMessage.sender.toString() === userId.toString();

        // Format lastMessage: "You: {message}" if sent by the current user
        chat.lastMessage = isSender
          ? `You: ${lastMessage.message}`
          : lastMessage.message;

        // Set message time
        chat.lastMessageTime = lastMessage.createdAt;

        // **📌 Mark as unread if not sent by the current user & not read**
        chat.unRead = !isSender && !lastMessage.readBy.includes(userId);
      } else {
        // No last message
        chat.lastMessage = '';
        chat.lastMessageTime = null;
        chat.unRead = false;
      }

      return chat;
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
