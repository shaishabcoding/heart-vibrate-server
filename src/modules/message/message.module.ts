import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { UploadModule } from '../upload/upload.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './repositories/message.repository';

@Module({
  imports: [ChatModule, UploadModule],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
})
export class MessageModule {}
