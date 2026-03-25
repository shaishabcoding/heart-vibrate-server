import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const EditMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message can't be empty")
    .max(5000, "Message can't be longer than 5000 characters"),
});

export class EditMessageDto extends createZodDto(EditMessageSchema) {}

export type EditMessageInput = z.infer<typeof EditMessageSchema>;
