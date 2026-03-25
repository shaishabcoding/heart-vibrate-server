import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SendMessageSchema = z.object({
  chatId: z.uuid('Invalid chat ID format'),
  content: z
    .string()
    .min(1, "Message can't be empty")
    .max(5000, "Message can't exceed 5000 characters"),
  replyToId: z.uuid('Invalid reply ID format').optional(),
});

export class SendMessageDto extends createZodDto(SendMessageSchema) {}

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
