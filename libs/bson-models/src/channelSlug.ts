import type { VarcharColumnModel } from 'from-schema';

export const channelSlug = {
	type: 'varchar',
	minLength: 3,
	maxLength: 30,
	pattern: '^[a-z0-9]{3,30}$',
} as const satisfies VarcharColumnModel;
