import type { EnumColumnModel } from 'from-schema';

export const groupFilter = {
	type: 'enum',
	enum: ['iCreated', 'iOwn', 'imIn'],
} as const satisfies EnumColumnModel;
