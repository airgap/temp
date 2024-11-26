import { EnumBsonSchema } from 'from-schema';

export const attachmentType = {
	description: 'The type of attachment you wish to upload',
	enum: ['image', 'gif', 'video', 'audio', 'text', 'markdown'],
} as const satisfies EnumBsonSchema;
