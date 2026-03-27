export const MessagePayload = {
  // Top-level properties
  id: 'string',
  chatId: 'string',
  content: 'string|null',
  replyToId: 'string|null',
  attachmentUrl: 'string|null',
  attachmentType: 'IMAGE|VIDEO|RAW|null',
  publicId: 'string|null',
  isEdited: 'boolean',
  createdAt: 'string',
  senderId: 'string|null',

  // Sender properties (flattened with dot notation)
  'sender.id': 'string',
  'sender.name': 'string|null',
  'sender.photoUrl': 'string|null',

  // ReplyTo properties
  'replyTo.id': 'string',
  'replyTo.content': 'string|null',
  'replyTo.sender.id': 'string',
  'replyTo.sender.name': 'string|null',
  'replyTo.sender.photoUrl': 'string|null',

  // SeenBy array - represent as JSON string or use custom format
  seenBy: 'string', // JSON stringified array of {userId, seenAt}

  // Reactions array - represent as JSON string
  reactions: 'string', // JSON stringified array of {id, userId, emoji}
} as const;
