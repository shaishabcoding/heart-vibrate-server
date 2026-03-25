import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatType, ParticipantRole } from '@prisma/client';
import { CreateChatInput } from './dto/create-chat.dto';
import { ChatRepository } from './repositories/chat.repository';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async createChat(userId: string, dto: CreateChatInput) {
    switch (dto.type) {
      case ChatType.DIRECT:
        return this.createDirectChat(userId, dto.participantId || userId, {
          allowExisting: true, //? Allow existing direct chat between the same users
          allowSelfChat: true, //? Allow self chat creation
        });

      case ChatType.GROUP:
        return this.createGroupChat(userId, dto.name, dto.participantIds);
    }
  }

  async createDirectChat(
    userId: string,
    participantId: string,
    options: { allowExisting?: boolean; allowSelfChat?: boolean } = {},
  ) {
    if (!options.allowSelfChat && userId === participantId) {
      throw new BadRequestException('Self chat is not allowed');
    }

    const existingChat = await this.chatRepository.findDirectChatBetweenUsers(
      userId,
      participantId,
    );

    if (existingChat) {
      if (!options.allowExisting) {
        throw new BadRequestException('Direct chat already exists between these users');
      }

      return existingChat;
    }

    //? unique works in only self-chat case, but it doesn't hurt to keep it for direct chat creation as well
    const uniqueParticipantIds = Array.from(new Set([userId, participantId]));

    return this.chatRepository.create({
      type: ChatType.DIRECT,
      participants: {
        createMany: {
          data: uniqueParticipantIds.map((id) => ({
            userId: id,
            role: ParticipantRole.MEMBER,
          })),
        },
      },
    });
  }

  async createGroupChat(userId: string, name: string, participantIds: string[]) {
    const uniqueParticipantIds = Array.from(new Set([userId, ...participantIds]));

    return this.chatRepository.create({
      type: ChatType.GROUP,
      name,
      participants: {
        createMany: {
          data: uniqueParticipantIds.map((id) => ({
            userId: id,
            role: id === userId ? ParticipantRole.ADMIN : ParticipantRole.MEMBER,
          })),
        },
      },
    });
  }
}
