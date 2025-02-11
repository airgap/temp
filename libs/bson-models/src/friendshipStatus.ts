import type { EnumColumnModel } from 'from-schema';

export const friendshipStatus = {
	type: 'enum',
	enum: ['befriended', 'theyOffered', 'youOffered', 'none'],
} as const satisfies EnumColumnModel;
