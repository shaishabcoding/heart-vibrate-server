import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './repositories/message.repository';

@Module({
  imports: [ChatModule],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
})
export class MessageModule {}
