import { EnumBsonSchema, FromBsonSchema } from 'from-schema';

export const friendshipStatus = {
	enum: ['befriended', 'theyOffered', 'youOffered', 'none'],
} as const satisfies EnumBsonSchema;
export type FriendshipStatus = FromBsonSchema<typeof friendshipStatus>;
