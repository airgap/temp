import { EnumBsonSchema, EnumColumnModel } from 'from-schema';

export const ttfFlowMode = {
	type: 'enum',
	enum: ['novice', 'easy', 'medium', 'hard'],
} as const satisfies EnumColumnModel;
