import type { PostgresRecordModel } from 'from-schema';

export const attachment = {
	description: 'Media attachment for posts',
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		postId: { type: 'bigint' },
		contentId: { type: 'varchar', maxLength: 64 },
		orderNum: { type: 'smallint' },
		provider: { type: 'smallint' },
		providerId: { type: 'varchar', maxLength: 255 },
		metadata: { type: 'jsonb' },
		status: { type: 'varchar', maxLength: 50, default: 'draft' },
		width: { type: 'integer' },
		height: { type: 'integer' },
		duration: { type: 'double precision' },
		size: { type: 'bigint' },
		type: { type: 'varchar', maxLength: 100 },
		filename: { type: 'varchar', maxLength: 255 },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['postId', 'contentId', 'orderNum', 'type', 'provider', 'created'],
} as const satisfies PostgresRecordModel;
