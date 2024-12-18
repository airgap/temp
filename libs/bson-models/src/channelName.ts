import { VarcharColumnModel } from 'from-schema';

export const channelName = {
	type: 'varchar',
	minLength: 3,
	maxLength: 30,
	pattern: '^[a-zA-Z0-9]{3,30}$',
} as const satisfies VarcharColumnModel;
