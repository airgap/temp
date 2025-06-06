import type { OneOfTsonSchema, PostgresRecordModel } from 'from-schema';
import { imageDoc } from './imageDoc';
import { videoDoc } from './videoDoc';

export const attachment = {
	description: 'Media attachment for posts',
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		postId: { type: 'bigint' },
		contentId: { type: 'varchar', maxLength: 64 },
		orderNum: { type: 'smallint' },
		type: { type: 'smallint' },
		provider: { type: 'smallint' },
		providerId: { type: 'varchar', maxLength: 255 },
		metadata: { type: 'jsonb' },
		status: { type: 'varchar', maxLength: 50, default: 'draft' },
		width: { type: 'integer' },
		height: { type: 'integer' },
		duration: { type: 'double precision' },
		size: { type: 'bigint' },
		mimeType: { type: 'varchar', maxLength: 100 },
		filename: { type: 'varchar', maxLength: 255 },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['postId', 'contentId', 'orderNum', 'type', 'provider', 'created'],
} as const satisfies PostgresRecordModel;
