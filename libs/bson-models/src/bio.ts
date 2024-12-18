import { VarcharColumnModel } from 'from-schema';

export const bio = {
	type: 'varchar',
	maxLength: 1024,
} as const satisfies VarcharColumnModel;
