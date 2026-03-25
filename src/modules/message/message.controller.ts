import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';
import { JwtGuard } from 'src/common/guards';
import {
  ApiAddReaction,
  ApiDeleteMessage,
  ApiEditMessage,
  ApiGetMessages,
  ApiMarkSeen,
  ApiRemoveReaction,
  ApiSendMessage,
} from './docs/message.docs';
import { EditMessageDto, type EditMessageInput } from './dto/edit-message.dto';
import { GetMessagesDto, type GetMessagesInput } from './dto/get-messages.dto';
import { ReactMessageDto, type ReactMessageInput } from './dto/react-message.dto';
import { SendMessageDto, type SendMessageInput } from './dto/send-message.dto';
import { MessageService } from './message.service';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiSendMessage()
  sendMessage(@CurrentUser('id') userId: string, @Body() dto: SendMessageDto) {
    return this.messageService.sendMessage(userId, dto as unknown as SendMessageInput);
  }

  @Get()
  @ApiGetMessages()
  getMessages(@CurrentUser('id') userId: string, @Query() dto: GetMessagesDto) {
    return this.messageService.getMessages(userId, dto as unknown as GetMessagesInput);
  }

  @Patch(':id')
  @ApiEditMessage()
  editMessage(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.messageService.editMessage(userId, messageId, dto as unknown as EditMessageInput);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteMessage()
  deleteMessage(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) messageId: string) {
    return this.messageService.deleteMessage(userId, messageId);
  }

  @Post(':id/seen')
  @HttpCode(HttpStatus.OK)
  @ApiMarkSeen()
  markSeen(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) messageId: string) {
    return this.messageService.markSeen(userId, messageId);
  }

  @Post(':id/reaction')
  @ApiAddReaction()
  addReaction(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) messageId: string,
    @Body() dto: ReactMessageDto,
  ) {
    return this.messageService.addReaction(userId, messageId, dto as unknown as ReactMessageInput);
  }

  @Delete(':id/reaction/:emoji')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRemoveReaction()
  removeReaction(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) messageId: string,
    @Param('emoji') emoji: string,
  ) {
    return this.messageService.removeReaction(userId, messageId, emoji);
  }
}
