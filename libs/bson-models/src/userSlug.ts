import type { TextColumnModel } from 'from-schema';

export const userSlug = {
	type: 'text',
	pattern: '^[a-z0-9$_]{3,20}$',
	minLength: 3,
	maxLength: 20,
} as const satisfies TextColumnModel;
