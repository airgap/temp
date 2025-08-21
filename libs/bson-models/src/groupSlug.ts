import { PostgresColumnModel } from 'from-schema';

export const groupSlug = {
	type: 'varchar',
	maxLength: 20,
	pattern: '^[a-zA-Z0-9_]{3,20}$',
} as const satisfies PostgresColumnModel;
