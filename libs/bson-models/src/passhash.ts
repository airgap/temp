import type { CharColumnModel } from 'from-schema';

export const passhash = {
	type: 'character',
	length: 64,
} as const satisfies CharColumnModel;
