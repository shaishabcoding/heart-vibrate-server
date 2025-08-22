import { z } from 'zod';
import { exists } from '../../../util/db/exists';
import { EMessageType } from '../../../../prisma';

export const MessageValidations = {
  send: z.object({
    chatId: z.string().refine(exists('chat'), {
      error: ({ input }) => `Chat not found with id: ${input}`,
      path: ['chatId'],
    }),
    type: z.enum(EMessageType).default(EMessageType.TEXT),
    content: z
      .string({
        error: 'Message content is required',
      })
      .nonempty('Message content is required'),
    replyToId: z
      .string()
      .refine(exists('message'), {
        error: ({ input }) => `Reply to message not found with id: ${input}`,
        path: ['replyToId'],
      })
      .optional(),
  }),

  editContent: z.object({
    messageId: z.string().refine(exists('message'), {
      error: ({ input }) => `Message not found with id: ${input}`,
      path: ['messageId'],
    }),
    content: z
      .string({
        error: 'Message content is required',
      })
      .nonempty('Message content is required'),
  }),
};

export type TMessageEditContent = z.infer<
  typeof MessageValidations.editContent
>;
