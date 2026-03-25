import { ChatType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UuidArray = z
  .array(z.uuid('Each participantId must be a valid UUID'))
  .refine((ids) => new Set(ids).size === ids.length, 'participantIds must not contain duplicates');

const DirectChatSchema = z.object({
  type: z.literal(ChatType.DIRECT),
  participantId: z.uuid('participantId must be a valid UUID').optional(), //? optional for self-chat creation, will be validated in service
});

const GroupChatSchema = z.object({
  type: z.literal(ChatType.GROUP),
  name: z
    .string('Group name is required')
    .min(1, 'Group name cannot be empty')
    .max(100, 'Group name cannot exceed 100 characters')
    .trim(),
  participantIds: UuidArray.min(2, 'Group chat requires at least 2 other participants').max(
    50,
    'Group chat cannot exceed 50 participants',
  ),
});

const CreateChatSchema = z.discriminatedUnion('type', [DirectChatSchema, GroupChatSchema]);

export type CreateChatInput = z.infer<typeof CreateChatSchema>;

export class CreateChatDto extends createZodDto(CreateChatSchema as unknown as z.ZodType<object>) {}
