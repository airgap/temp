import { CharColumnModel } from 'from-schema';

export const ttmBoard = {
	type: 'character',
	length: 25,
	pattern: '^[XO-]{25}$',
} as const satisfies CharColumnModel;
