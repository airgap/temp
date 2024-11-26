import { EnumBsonSchema } from 'from-schema';

export const ttfFlowMode = {
	enum: ['novice', 'easy', 'medium', 'hard'],
} as const satisfies EnumBsonSchema;
