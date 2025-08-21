import { StatusCodes } from 'http-status-codes';
import { Chat as TChat } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TChatEdit, TChatJoin } from './Chat.validation';
import { deleteImage } from '../../middlewares/capture';

export const ChatServices = {
  async join({ target, banner, name, userId }: TChatJoin & { userId: string }) {
    let chat: TChat | null = null;
    const userIds = target.concat(userId).sort();

    //* Create one to one chat
    if (target.length < 2) {
      // Assign Old chat if exists
      chat = await prisma.chat.findFirst({
        where: { isGroup: false, userIds: { hasEvery: userIds } },
      });

      // Else create a new one
      if (!chat)
        chat = await prisma.chat.create({
          data: { name, banner, userIds, isGroup: false, adminIds: userIds },
        });
    } else {
      //* Create group chat
      chat = await prisma.chat.create({
        data: { name, banner, userIds, isGroup: true, adminIds: [userId] },
      });
    }

    return chat;
  },

  async edit({
    adminIds,
    banner,
    name,
    userIds,
    chatId,
    userId,
  }: TChatEdit & { userId: string; chatId: string }) {
    let chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat?.adminIds.includes(userId))
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to edit this chat',
      );

    // Delete old banner for new banner
    if (banner) chat.banner?._pipe(deleteImage);

    chat = await prisma.chat.update({
      where: { id: chatId },
      data: { name, banner, adminIds, userIds },
    });

    // TODO: update socket +> inbox

    return chat;
  },

  async delete({ chatId, userId }: { chatId: string; userId: string }) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });

    if (!chat?.adminIds.includes(userId))
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to delete this chat',
      );

    await prisma.chat.delete({ where: { id: chatId } });

    // Delete the associated chat image
    chat.banner?._pipe(deleteImage);

    // TODO: update socket +> inbox
  },
};
