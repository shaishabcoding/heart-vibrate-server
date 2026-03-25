import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { ChatService } from './chat.service';
import { CreateChatDto, type CreateChatInput } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createChat(@CurrentUser() userId: string, @Body() dto: CreateChatDto) {
    return this.chatService.createChat(userId, dto as unknown as CreateChatInput);
  }
}
