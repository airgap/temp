import type { TextColumnModel } from 'from-schema';

export const error = {
	type: 'text',
	description: 'The first error encountered, if any',
} as const satisfies TextColumnModel;
