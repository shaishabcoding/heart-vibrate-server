import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { JwtGuard } from 'src/common/guards';
import { ChatService } from './chat.service';
import { CreateChatDto, type CreateChatInput } from './dto/create-chat.dto';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createChat(@CurrentUser('id') userId: string, @Body() dto: CreateChatDto) {
    return this.chatService.createChat(userId, dto as unknown as CreateChatInput);
  }
}
