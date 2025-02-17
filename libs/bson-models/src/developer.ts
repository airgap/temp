import type { PostgresRecordModel } from 'from-schema';

export const developer = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		homepage: { type: 'text' },
		name: { type: 'text', maxLength: 100 },
		thumbnail: { type: 'text' },
	},
	required: ['id', 'name', 'homepage'],
} as const satisfies PostgresRecordModel;
