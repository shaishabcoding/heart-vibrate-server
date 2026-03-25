import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const GetMessagesSchema = z.object({
  chatId: z.uuid('Invalid chat ID format'),
  cursor: z.uuid('Invalid cursor format').optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class GetMessagesDto extends createZodDto(GetMessagesSchema) {}

export type GetMessagesInput = z.infer<typeof GetMessagesSchema>;
