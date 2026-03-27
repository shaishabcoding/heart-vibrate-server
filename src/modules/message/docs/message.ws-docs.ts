import { applyDecorators } from '@nestjs/common';
import { WsDoc } from '@wsgate/nest';
import { MessagePayload } from './models/message.model';

// new_message event
export const WsgateNewMessage = () =>
  applyDecorators(
    WsDoc({
      event: 'new_message',
      type: 'subscribe',
      description: 'Emitted when a new message is sent in a chat.',
      payload: MessagePayload,
    }),
  );

// message_edited event
export const WsgateMessageEdited = () =>
  applyDecorators(
    WsDoc({
      event: 'message_edited',
      type: 'subscribe',
      description: 'Emitted when a message is edited in a chat.',
      payload: {
        ...MessagePayload,
        isEdited: 'boolean',
      },
    }),
  );

// message_deleted event
export const WsgateMessageDeleted = () =>
  applyDecorators(
    WsDoc({
      event: 'message_deleted',
      type: 'subscribe',
      description: 'Emitted when a message is deleted from a chat.',
      payload: {
        messageId: 'string',
      },
    }),
  );

// message_seen event
export const WsgateMessageSeen = () =>
  applyDecorators(
    WsDoc({
      event: 'message_seen',
      type: 'subscribe',
      description: 'Emitted when a user marks a message as seen in a chat.',
      payload: {
        messageId: 'string',
        userId: 'string',
        seenAt: 'string',
      },
    }),
  );

// reaction_added event
export const WsgateReactionAdded = () =>
  applyDecorators(
    WsDoc({
      event: 'reaction_added',
      type: 'subscribe',
      description: 'Emitted when a user adds a reaction to a message.',
      payload: {
        messageId: 'string',
        userId: 'string',
        emoji: 'string',
      },
    }),
  );

// reaction_removed event
export const WsgateReactionRemoved = () =>
  applyDecorators(
    WsDoc({
      event: 'reaction_removed',
      type: 'subscribe',
      description: 'Emitted when a user removes a reaction from a message.',
      payload: {
        messageId: 'string',
        userId: 'string',
        emoji: 'string',
      },
    }),
  );
