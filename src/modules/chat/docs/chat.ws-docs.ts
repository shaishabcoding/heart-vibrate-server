import { applyDecorators } from '@nestjs/common';
import { WsDoc } from '@wsgate/nest';

export const WsgateJoinChat = () =>
  applyDecorators(
    WsDoc({
      event: 'joinChat',
      description: 'Join a chat room.',
      payload: { chatId: 'string' },
      type: 'emit',
    }),
  );

export const WsgateLeaveChat = () =>
  applyDecorators(
    WsDoc({
      event: 'leaveChat',
      description: 'Leave a chat room.',
      payload: { chatId: 'string' },
      type: 'emit',
    }),
  );

export const WsgateTyping = () =>
  applyDecorators(
    WsDoc({
      event: 'typing',
      description: 'Indicate that the user is typing in a chat.',
      payload: { chatId: 'string' },
      type: 'emit',
    }),
  );

export const WsgateStopTyping = () =>
  applyDecorators(
    WsDoc({
      event: 'stopTyping',
      description: 'Indicate that the user has stopped typing in a chat.',
      payload: { chatId: 'string' },
      type: 'emit',
    }),
  );
