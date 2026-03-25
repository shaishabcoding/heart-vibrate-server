import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ReactMessageSchema = z.object({
  emoji: z.string().min(1, "Emoji can't be empty").max(10, 'Emoji is too long'),
});

export class ReactMessageDto extends createZodDto(ReactMessageSchema) {}

export type ReactMessageInput = z.infer<typeof ReactMessageSchema>;
