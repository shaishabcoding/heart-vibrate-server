import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const ApiSendMessage = () =>
  applyDecorators(
    ApiOperation({ summary: 'Send a message to a chat' }),
    ApiResponse({ status: 201, description: 'Message sent' }),
    ApiResponse({ status: 403, description: 'Not a participant of this chat' }),
  );

export const ApiGetMessages = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get paginated messages for a chat (newest first)' }),
    ApiQuery({ name: 'chatId', required: true, type: String }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description: 'Last message ID for next page',
    }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
    ApiResponse({ status: 200, description: '{ data: Message[], nextCursor: string | null }' }),
    ApiResponse({ status: 403, description: 'Not a participant of this chat' }),
  );

export const ApiEditMessage = () =>
  applyDecorators(
    ApiOperation({ summary: 'Edit your own message (sets isEdited: true)' }),
    ApiParam({ name: 'id', description: 'Message ID' }),
    ApiResponse({ status: 200, description: 'Updated message' }),
    ApiResponse({ status: 403, description: 'Not the message owner' }),
    ApiResponse({ status: 404, description: 'Message not found' }),
  );

export const ApiDeleteMessage = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete your own message' }),
    ApiParam({ name: 'id', description: 'Message ID' }),
    ApiResponse({ status: 204, description: 'Deleted' }),
    ApiResponse({ status: 403, description: 'Not the message owner' }),
    ApiResponse({ status: 404, description: 'Message not found' }),
  );

export const ApiMarkSeen = () =>
  applyDecorators(
    ApiOperation({ summary: 'Mark a message as seen by the current user' }),
    ApiParam({ name: 'id', description: 'Message ID' }),
    ApiResponse({
      status: 200,
      description: 'MessageSeen record (upsert — safe to call multiple times)',
    }),
    ApiResponse({ status: 403, description: 'Not a participant of this chat' }),
    ApiResponse({ status: 404, description: 'Message not found' }),
  );

export const ApiAddReaction = () =>
  applyDecorators(
    ApiOperation({ summary: 'Add an emoji reaction to a message' }),
    ApiParam({ name: 'id', description: 'Message ID' }),
    ApiResponse({
      status: 201,
      description: 'Reaction added (upsert — safe to call multiple times)',
    }),
    ApiResponse({ status: 403, description: 'Not a participant of this chat' }),
    ApiResponse({ status: 404, description: 'Message not found' }),
  );

export const ApiRemoveReaction = () =>
  applyDecorators(
    ApiOperation({ summary: 'Remove your emoji reaction from a message' }),
    ApiParam({ name: 'id', description: 'Message ID' }),
    ApiParam({ name: 'emoji', description: 'Emoji to remove' }),
    ApiResponse({ status: 204, description: 'Reaction removed' }),
    ApiResponse({ status: 403, description: 'Not a participant of this chat' }),
    ApiResponse({ status: 404, description: 'Message not found' }),
  );
