import { CharColumnModel } from 'from-schema';
export const hex = {
	type: 'char',
	length: 6,
	pattern: '^[0-9A-Fa-f]{6}$',
} as const satisfies CharColumnModel;
