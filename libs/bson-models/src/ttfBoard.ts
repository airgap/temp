import { CharColumnModel } from 'from-schema';

export const ttfBoard = {
	type: 'char',
	pattern: '^[XO-]{9}[0-2]$',
	length: 10,
} as const satisfies CharColumnModel;
