import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';

// Reusable include shape — used in create, findById, findByChatId
const MESSAGE_INCLUDE = {
  sender: { select: { id: true, name: true, photoUrl: true } },
  replyTo: {
    select: {
      id: true,
      content: true,
      sender: { select: { id: true, name: true, photoUrl: true } },
    },
  },
  reactions: {
    select: { id: true, emoji: true, userId: true },
  },
  seenBy: {
    select: { userId: true, seenAt: true },
  },
} satisfies Prisma.MessageInclude;

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MessageCreateInput) {
    return this.prisma.message.create({ data, include: MESSAGE_INCLUDE });
  }

  findById(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      include: MESSAGE_INCLUDE,
    });
  }

  async findByChatId(chatId: string, cursor?: string, limit: number = 20) {
    const messages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: MESSAGE_INCLUDE,
    });

    const hasNextPage = messages.length > limit;
    const data = hasNextPage ? messages.slice(0, limit) : messages;
    const nextCursor = hasNextPage ? data[data.length - 1].id : null;

    return { data, nextCursor };
  }

  update(id: string, data: Prisma.MessageUpdateInput) {
    return this.prisma.message.update({
      where: { id },
      data,
      include: MESSAGE_INCLUDE,
    });
  }

  delete(id: string) {
    return this.prisma.message.delete({ where: { id } });
  }

  // ── Seen ──────────────────────────────────────────────────────────────────

  markSeen(messageId: string, userId: string) {
    return this.prisma.messageSeen.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId },
      update: {}, // already seen — no-op
    });
  }

  // ── Reactions ─────────────────────────────────────────────────────────────

  upsertReaction(messageId: string, userId: string, emoji: string) {
    return this.prisma.messageReaction.upsert({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
      create: { messageId, userId, emoji },
      update: {}, // already reacted — no-op
    });
  }

  deleteReaction(messageId: string, userId: string, emoji: string) {
    return this.prisma.messageReaction.delete({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
    });
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  isParticipant(chatId: string, userId: string) {
    return this.prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
  }
}
