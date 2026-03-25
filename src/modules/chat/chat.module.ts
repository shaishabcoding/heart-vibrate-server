import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatRepository } from './repositories/chat.repository';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChatRepository],
})
export class ChatModule {}
