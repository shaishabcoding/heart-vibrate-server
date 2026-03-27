import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ChatGateway } from '../chat/chat.gateway';
import { WsgateNewMessage } from './docs/message.ws-docs';
import { EditMessageInput } from './dto/edit-message.dto';
import { GetMessagesInput } from './dto/get-messages.dto';
import { ReactMessageInput } from './dto/react-message.dto';
import { SendMessageInput } from './dto/send-message.dto';
import { MessageRepository } from './repositories/message.repository';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatGateway: ChatGateway,
  ) {}

  @WsgateNewMessage()
  async sendMessage(userId: string, dto: SendMessageInput) {
    this.logger.log(`Sending message — userId: ${userId}, chatId: ${dto.chatId}`);

    await this.verifyParticipant(dto.chatId, userId);

    const message = await this.messageRepository.create({
      ...(dto.content && { content: dto.content }),
      ...(dto.attachmentUrl && {
        attachmentUrl: dto.attachmentUrl,
        attachmentType: dto.attachmentType,
        publicId: dto.publicId,
      }),
      chat: { connect: { id: dto.chatId } },
      sender: { connect: { id: userId } },
      ...(dto.replyToId && { replyTo: { connect: { id: dto.replyToId } } }),
    });

    this.chatGateway.emitToChat(dto.chatId, 'new_message', message);

    this.logger.log(`Message sent — messageId: ${message.id}, chatId: ${dto.chatId}`);
    return message;
  }

  async getMessages(userId: string, dto: GetMessagesInput) {
    this.logger.log(
      `Fetching messages — userId: ${userId}, chatId: ${dto.chatId}, cursor: ${dto.cursor ?? 'none'}`,
    );

    await this.verifyParticipant(dto.chatId, userId);

    const result = await this.messageRepository.findByChatId(dto.chatId, dto.cursor, dto.limit);

    this.logger.log(
      `Messages fetched — chatId: ${dto.chatId}, count: ${result.data.length}, hasMore: ${!!result.nextCursor}`,
    );
    return result;
  }

  async editMessage(userId: string, messageId: string, dto: EditMessageInput) {
    this.logger.log(`Editing message — userId: ${userId}, messageId: ${messageId}`);

    await this.verifyMessageOwner(messageId, userId);

    const message = await this.messageRepository.update(messageId, {
      content: dto.content,
      isEdited: true,
    });

    this.chatGateway.emitToChat(message.chatId, 'message_edited', message);

    this.logger.log(`Message edited — messageId: ${messageId}`);
    return message;
  }

  async deleteMessage(userId: string, messageId: string) {
    this.logger.log(`Deleting message — userId: ${userId}, messageId: ${messageId}`);

    const message = await this.verifyMessageOwner(messageId, userId);
    await this.messageRepository.delete(messageId);

    this.chatGateway.emitToChat(message.chatId, 'message_deleted', {
      messageId,
    });

    this.logger.log(`Message deleted — messageId: ${messageId}`);
  }

  async markSeen(userId: string, messageId: string) {
    this.logger.log(`Marking seen — userId: ${userId}, messageId: ${messageId}`);

    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');

    await this.verifyParticipant(message.chatId, userId);

    const seen = await this.messageRepository.markSeen(messageId, userId);

    this.chatGateway.emitToChat(message.chatId, 'message_seen', {
      messageId,
      userId,
      seenAt: seen.seenAt,
    });

    this.logger.log(`Message seen — messageId: ${messageId}, userId: ${userId}`);
    return seen;
  }

  async addReaction(userId: string, messageId: string, dto: ReactMessageInput) {
    this.logger.log(
      `Adding reaction — userId: ${userId}, messageId: ${messageId}, emoji: ${dto.emoji}`,
    );

    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');

    await this.verifyParticipant(message.chatId, userId);

    const reaction = await this.messageRepository.upsertReaction(messageId, userId, dto.emoji);

    this.chatGateway.emitToChat(message.chatId, 'reaction_added', {
      messageId,
      userId,
      emoji: dto.emoji,
    });

    this.logger.log(`Reaction added — messageId: ${messageId}, emoji: ${dto.emoji}`);
    return reaction;
  }

  async removeReaction(userId: string, messageId: string, emoji: string) {
    this.logger.log(
      `Removing reaction — userId: ${userId}, messageId: ${messageId}, emoji: ${emoji}`,
    );

    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');

    await this.verifyParticipant(message.chatId, userId);

    await this.messageRepository.deleteReaction(messageId, userId, emoji);

    this.chatGateway.emitToChat(message.chatId, 'reaction_removed', {
      messageId,
      userId,
      emoji,
    });

    this.logger.log(`Reaction removed — messageId: ${messageId}, emoji: ${emoji}`);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async verifyParticipant(chatId: string, userId: string) {
    const participant = await this.messageRepository.isParticipant(chatId, userId);
    if (!participant) {
      this.logger.warn(`Unauthorized chat access — userId: ${userId}, chatId: ${chatId}`);
      throw new ForbiddenException('You are not a participant of this chat');
    }
  }

  private async verifyMessageOwner(messageId: string, userId: string) {
    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      this.logger.warn(
        `Unauthorized message edit/delete — userId: ${userId}, messageId: ${messageId}`,
      );
      throw new ForbiddenException('You can only modify your own messages');
    }
    return message;
  }
}
