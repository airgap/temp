import { EnumColumnModel } from 'from-schema';

export const attachmentType = {
	type: 'enum',
	description: 'The type of attachment you wish to upload',
	enum: ['image', 'gif', 'video', 'audio', 'text', 'markdown'],
} as const satisfies EnumColumnModel;
