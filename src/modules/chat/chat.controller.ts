import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';
import { JwtGuard } from 'src/common/guards';
import { ChatService } from './chat.service';
import { ApiCreateChat } from './docs/chat.docs';
import { CreateChatDto, type CreateChatInput } from './dto/create-chat.dto';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiCreateChat()
  createChat(@CurrentUser('id') userId: string, @Body() dto: CreateChatDto) {
    return this.chatService.createChat(userId, dto as unknown as CreateChatInput);
  }
}
