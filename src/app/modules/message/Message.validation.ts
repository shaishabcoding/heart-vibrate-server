import { z } from 'zod';
import { exists } from '../../../util/db/exists';
import { EMessageType } from '../../../../prisma';

export const MessageValidations = {
  send: z.object({
    chatId: z.string().refine(exists('chat'), id => ({
      message: `Chat not found with id: ${id}`,
      path: ['chatId'],
    })),
    type: z.nativeEnum(EMessageType).default(EMessageType.TEXT),
    content: z
      .string({
        required_error: 'Message content is required',
      })
      .min(1, 'Message content is required'),
    replyToId: z
      .string()
      .refine(exists('message'), id => ({
        message: `Replied Message not found with id: ${id}`,
        path: ['replyToId'],
      }))
      .optional(),
  }),
};
