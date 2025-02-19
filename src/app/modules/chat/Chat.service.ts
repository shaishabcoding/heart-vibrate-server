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
          'lastMessage.message': 1,
          'lastMessage.sender': 1,
          'lastMessage.createdAt': 1,
          'lastMessage.readBy': 1,
        },
      },
    ]);

    // Convert messages into a Map for quick lookup
    const lastMessageMap = new Map(
      lastMessages.map(msg => [msg._id.toString(), msg.lastMessage]),
    );

    return chats.map(chat => {
      if (!chat.isGroup) {
        const otherUser = chat.users.find(user => !user._id.equals(userId));
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
          ? `You: ${lastMessage.message}`
          : lastMessage.message;
        chat.lastMessageTime = lastMessage.createdAt;
        chat.unRead =
          !isSender && !lastMessage.readBy?.some(id => id.equals(userId));
      } else {
        chat.lastMessage = '';
        chat.lastMessageTime = null;
        chat.unRead = false;
      }

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
};
