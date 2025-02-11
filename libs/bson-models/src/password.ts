import type { VarcharColumnModel } from 'from-schema';

export const password = {
	type: 'varchar',
	minLength: 10,
	maxLength: 50,
} as const satisfies VarcharColumnModel;
