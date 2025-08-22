import { StatusCodes } from 'http-status-codes';
import { Message as TMessage } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TMessageEditContent } from './Message.validation';
import { TList } from '../query/Query.interface';
import { TPagination } from '../../../util/server/serveResponse';

export const MessageServices = {
  async create(messageData: TMessage) {
    Object.assign(messageData, {
      readBy: [messageData.senderId],
      history: [{ content: messageData.content, time: new Date() }],
    });

    return prisma.message.create({
      data: messageData,
      omit: {
        history: true,
      },
    });
  },

  async editContent({
    messageId,
    content,
    userId,
  }: TMessageEditContent & { userId: string }) {
    const { isAuthorized, author } = await this.authorized({
      messageId,
      userId,
    });

    if (!isAuthorized)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You can't edit ${author}'s message`,
      );

    return prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        history: {
          push: { content, time: new Date() },
        },
      },
      omit: {
        history: true,
      },
    });
  },

  async delete({ messageId, userId }: { messageId: string; userId: string }) {
    const { isAuthorized, author } = await this.authorized({
      messageId,
      userId,
    });

    if (!isAuthorized)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You can't delete ${author}'s message`,
      );

    return prisma.message.update({
      where: { id: messageId },
      data: {
        content: null, // unsent message
      },
    });
  },

  async authorized({
    messageId,
    userId,
  }: {
    messageId: string;
    userId: string;
  }) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      isAuthorized: message?.senderId === userId,
      author: message?.sender?.name,
    };
  },

  async retrieveAll({
    chatId,
    userId,
    limit,
    page,
  }: { chatId: string; userId: string } & TList) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat?.userIds.includes(userId))
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to access this chat',
      );

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        sender: {
          select: {
            name: true,
            avatar: true,
          },
        },
        replyTo: {
          select: {
            content: true,
            type: true,
          },
        },
      },
    });

    const total = await prisma.message.count({ where: { chatId } });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      messages,
    };
  },
};
