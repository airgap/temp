import type { TextColumnModel } from 'from-schema';
export const idBond = {
	type: 'text',
	pattern: `^[0-9af]{1,32}-[0-9af]{1,32}$`,
} as const satisfies TextColumnModel;
