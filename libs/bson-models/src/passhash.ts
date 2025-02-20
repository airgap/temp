import type { VarcharColumnModel } from 'from-schema';

export const passhash = {
	type: 'varchar',
	maxLength: 64,
} as const satisfies VarcharColumnModel;
