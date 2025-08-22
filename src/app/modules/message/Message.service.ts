import { Message as TMessage } from '../../../../prisma';
import prisma from '../../../util/prisma';

export const MessageServices = {
  async create(messageData: TMessage) {
    Object.assign(messageData, {
      readBy: [messageData.senderId],
      history: [{ content: messageData.content, time: new Date() }],
    });

    return prisma.message.create({ data: messageData });
  },
};
