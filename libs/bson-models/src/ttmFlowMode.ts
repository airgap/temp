import { EnumBsonSchema } from 'from-schema';

export const ttmFlowMode = {
	enum: ['novice'],
} as const satisfies EnumBsonSchema;
