import { applyDecorators } from '@nestjs/common';
import { WsDoc } from '@wsgate/nest';
import { MessagePayload } from './models/message.model';

export const WsgateNewMessage = () =>
  applyDecorators(
    WsDoc({
      event: 'new_message',
      type: 'subscribe',
      description: 'Emitted when a new message is sent in a chat.',
      payload: MessagePayload,
    }),
  );
