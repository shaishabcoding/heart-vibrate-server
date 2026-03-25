import { ApiProperty } from '@nestjs/swagger';

export class DirectChatModel {
  @ApiProperty({ enum: ['DIRECT'], example: 'DIRECT', required: true })
  type!: 'DIRECT';

  @ApiProperty({
    description: 'Target user UUID. Omit to create a self-chat.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  participantId?: string;
}
