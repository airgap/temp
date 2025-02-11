import type { EnumColumnModel } from 'from-schema';

export const ttmFlowMode = {
	type: 'enum',
	enum: ['novice'],
} as const satisfies EnumColumnModel;
