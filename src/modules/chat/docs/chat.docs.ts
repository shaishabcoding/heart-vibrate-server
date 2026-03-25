import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { DirectChatModel } from './models/direct-chat.model';
import { GroupChatModel } from './models/group-chat.model';

const ChatSchema = () => ({
  oneOf: [{ $ref: getSchemaPath(DirectChatModel) }, { $ref: getSchemaPath(GroupChatModel) }],
  discriminator: {
    propertyName: 'type',
    mapping: {
      DIRECT: getSchemaPath(DirectChatModel),
      GROUP: getSchemaPath(GroupChatModel),
    },
  },
});

export const ApiCreateChat = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a chat',
      description: 'Creates a DIRECT or GROUP chat. Discriminated by the `type` field.',
    }),
    ApiExtraModels(DirectChatModel, GroupChatModel),
    ApiBody({ schema: ChatSchema() }),
    ApiCreatedResponse({ description: 'Chat created successfully', schema: ChatSchema() }),
    ApiBadRequestResponse({ description: 'Validation failed or business rule violated' }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' }),
  );
