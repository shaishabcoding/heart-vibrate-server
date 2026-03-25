import { ApiProperty } from '@nestjs/swagger';

export class GroupChatModel {
  @ApiProperty({ enum: ['GROUP'], example: 'GROUP', required: true })
  type!: 'GROUP';

  @ApiProperty({
    description: 'Group chat name',
    example: 'Weekend Squad',
    minLength: 1,
    maxLength: 100,
  })
  name!: string;

  @ApiProperty({
    description: 'At least 2 other participant UUIDs (max 50, no duplicates)',
    example: ['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51a2-43f7-9abc-426614174000'],
    minItems: 2,
    maxItems: 50,
    uniqueItems: true,
    type: [String],
  })
  participantIds!: string[];
}
