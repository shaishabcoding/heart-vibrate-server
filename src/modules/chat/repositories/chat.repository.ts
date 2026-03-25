import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ChatCreateInput) {
    return this.prisma.chat.create({ data });
  }

  async findDirectChatBetweenUsers(userId1: string, userId2: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ],
      },
    });

    return chat;
  }
}
