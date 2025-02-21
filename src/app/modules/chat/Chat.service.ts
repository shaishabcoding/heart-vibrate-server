/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import Chat from './Chat.model';
import User from '../user/User.model';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import Message from '../message/Message.model';
import deleteFile from '../../../shared/deleteFile';
import { TUser } from '../user/User.interface';
import { io } from '../../../helpers/useSocket';
import { IChat } from './Chat.interface';

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

  async list(userId: Types.ObjectId) {
    // Fetch chats where the user is a participant
    const chats = await Chat.find({ users: userId })
      .sort('-updatedAt')
      .populate({ path: 'users', select: 'name email avatar _id' })
      .populate({ path: 'admins', select: 'name avatar _id' })
      .lean();

    if (!chats.length) return [];

    // Get chat IDs
    const chatIds = chats.map(chat => chat._id);

    // Fetch the latest messages for each chat
    const lastMessages = await Message.aggregate([
      { $match: { chat: { $in: chatIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$chat', lastMessage: { $first: '$$ROOT' } } },
      {
        $project: {
          _id: 1,
          'lastMessage.content': 1,
          'lastMessage.type': 1,
          'lastMessage.sender': 1,
          'lastMessage.updatedAt': 1,
          'lastMessage.readBy': 1,
        },
      },
    ]);

    // Fetch unread message count per chat
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          chat: { $in: chatIds },
          readBy: { $ne: userId }, // Messages that have NOT been read by user
        },
      },
      {
        $group: {
          _id: '$chat',
          unreadCount: { $sum: 1 }, // Count unread messages
        },
      },
    ]);

    // Convert messages into a Map for quick lookup
    const lastMessageMap = new Map(
      lastMessages.map(msg => [msg._id.toString(), msg.lastMessage]),
    );

    // Convert unread counts into a Map for quick lookup
    const unreadCountMap = new Map(
      unreadCounts.map(count => [count._id.toString(), count.unreadCount]),
    );

    return chats.map((chat: any) => {
      if (!chat.isGroup) {
        const otherUser = chat.users.find(
          (user: any) => !user._id.equals(userId),
        );
        if (otherUser) {
          chat.name =
            `${otherUser.name?.firstName ?? ''} ${otherUser.name?.lastName ?? ''}`.trim();
          chat.image = otherUser.avatar;
          chat.sender = otherUser.email;
        }
      }

      const lastMessage = lastMessageMap.get(chat._id.toString());
      if (lastMessage) {
        const isSender = lastMessage.sender.equals(userId);
        chat.lastMessage = isSender
          ? `You: ${lastMessage.type !== 'text' ? lastMessage.type : lastMessage.content}`
          : lastMessage.type !== 'text'
            ? lastMessage.type
            : lastMessage.content;
        chat.lastMessageTime = lastMessage.updatedAt;
        chat.unRead =
          !isSender &&
          !lastMessage.readBy?.some((id: any) => id.equals(userId));
      } else {
        chat.lastMessage = '';
        chat.lastMessageTime = null;
        chat.unRead = false;
      }

      // Add unread count for each chat
      chat.unreadCount = unreadCountMap.get(chat._id.toString()) || 0;

      return chat;
    });
  },

  async pop(chatId: string, userId: Types.ObjectId) {
    const chat = await Chat.findById(chatId).populate(
      'users',
      '_id name avatar email',
    );

    if (!chat) throw new ServerError(StatusCodes.NOT_FOUND, 'Chat not found');

    await Promise.all(
      (chat.users as unknown as TUser[]).map(({ email }) =>
        io!.to(`inbox_${email}`).emit('inboxUpdated'),
      ),
    );

    io!.to(chatId).emit('chatUpdated');

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

  async retrieve(userId: Types.ObjectId, chatId: string) {
    const chat = await Chat.findById(chatId)
      .populate({
        path: 'users',
        select: 'name avatar _id',
      })
      .populate({
        path: 'admins',
        select: 'name avatar _id',
      });

    if (!chat) throw new ServerError(StatusCodes.NOT_FOUND, 'Chat not found');

    if (!chat.isGroup) {
      const otherUser = chat.users.find(
        (user: any) => !user._id.equals(userId),
      ) as Partial<TUser>;

      if (otherUser) {
        chat.name = `${otherUser.name?.firstName} ${otherUser.name?.lastName}`;
        chat.image = otherUser.avatar;
      }
    }

    return chat;
  },

  async update(chatId: string, chat: Partial<IChat>) {
    const updatedChat = await Chat.findByIdAndUpdate(chatId, chat, {
      new: true,
    }).populate('users', 'email');

    if (!updatedChat)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Chat not found');

    await Promise.all(
      (updatedChat.users as unknown as TUser[]).map(({ email }) =>
        io!.to(`inbox_${email}`).emit('inboxUpdated'),
      ),
    );

    return updatedChat;
  },
};
