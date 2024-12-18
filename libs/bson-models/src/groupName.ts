import { VarcharColumnModel } from 'from-schema';

export const groupName = {
	type: 'varchar',
	maxLength: 30,
	pattern: '^.{3,30}$',
} as const satisfies VarcharColumnModel;
