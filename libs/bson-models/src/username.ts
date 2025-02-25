import type { VarcharColumnModel } from 'from-schema';

export const username = {
	type: 'varchar',
	maxLength: 20,
	pattern: '^(?!.*lyku)[a-zA-Z0-9$_]{3,20}$',
} as const satisfies VarcharColumnModel;
