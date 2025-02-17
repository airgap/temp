import type { PostgresRecordModel } from 'from-schema';

export const publisher = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		homepage: { type: 'text', minLength: 1, maxLength: 50 },
		name: { type: 'text', minLength: 1, maxLength: 50 },
	},
	required: ['id', 'name', 'homepage'],
} as const satisfies PostgresRecordModel;
