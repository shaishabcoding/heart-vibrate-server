import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ChatType, ParticipantRole } from '@prisma/client';
import { CreateChatInput } from './dto/create-chat.dto';
import { ChatRepository } from './repositories/chat.repository';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly chatRepository: ChatRepository) {}

  async createChat(userId: string, dto: CreateChatInput) {
    this.logger.log(`Creating ${dto.type} chat for user ${userId}`);

    switch (dto.type) {
      case ChatType.DIRECT:
        return this.createDirectChat(userId, dto.participantId || userId, {
          allowExisting: true,
          allowSelfChat: true,
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
    const isSelfChat = userId === participantId;
    this.logger.log(
      `Creating direct chat — userId: ${userId}, participantId: ${participantId}, selfChat: ${isSelfChat}`,
    );

    if (!options.allowSelfChat && isSelfChat) {
      this.logger.warn(`Self chat attempt blocked for user ${userId}`);
      throw new BadRequestException('Self chat is not allowed');
    }

    const existingChat = await this.chatRepository.findDirectChatBetweenUsers(
      userId,
      participantId,
    );

    if (existingChat) {
      if (!options.allowExisting) {
        this.logger.warn(
          `Duplicate direct chat attempt — userId: ${userId}, participantId: ${participantId}`,
        );
        throw new BadRequestException('Direct chat already exists between these users');
      }

      this.logger.log(`Returning existing direct chat ${existingChat.id}`);
      return existingChat;
    }

    const uniqueParticipantIds = Array.from(new Set([userId, participantId]));
    const chat = await this.chatRepository.create({
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

    this.logger.log(`Direct chat created — chatId: ${chat.id}`);
    return chat;
  }

  async createGroupChat(userId: string, name: string, participantIds: string[]) {
    const uniqueParticipantIds = Array.from(new Set([userId, ...participantIds]));
    this.logger.log(
      `Creating group chat "${name}" — creatorId: ${userId}, participants: ${uniqueParticipantIds.length}`,
    );

    const chat = await this.chatRepository.create({
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

    this.logger.log(`Group chat created — chatId: ${chat.id}`);
    return chat;
  }
}
