import type { PostgresRecordModel } from 'from-schema';

export const notification = {
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		user: { type: 'bigint' },
		title: { type: 'varchar', minLength: 5, maxLength: 50 },
		subtitle: { type: 'varchar', minLength: 5, maxLength: 50 },
		body: { type: 'text', maxLength: 1000 },
		icon: { type: 'varchar', minLength: 5, maxLength: 50 },
		href: { type: 'varchar', minLength: 5, maxLength: 50 },
		posted: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		read: { type: 'timestamptz' },
	},
	required: ['id', 'user', 'title', 'body', 'icon', 'posted'],
} as const satisfies PostgresRecordModel;
