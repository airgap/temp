import type { PostgresRecordModel } from 'from-schema';
import { groupName } from './groupName';

export const group = {
	properties: {
		id: {
			type: 'bigserial',
			primaryKey: true,
		},
		slug: {
			type: 'varchar',
			maxLength: 20,
			pattern: '^[a-zA-Z0-9_]{3,20}$',
		},
		lowerSlug: {
			type: 'varchar',
			maxLength: 20,
			pattern: '^[a-z0-9_]{3,20}$',
		},
		name: groupName,
		creator: { type: 'bigint' },
		owner: { type: 'bigint' },
		created: { type: 'timestamp' },
		private: { type: 'boolean' },
		thumbnail: { type: 'varchar', maxLength: 30 },
		background: { type: 'varchar', maxLength: 30 },
	},
	required: [
		'id',
		'name',
		'slug',
		'lowerSlug',
		'owner',
		'creator',
		'created',
		'private',
	],
} as const satisfies PostgresRecordModel;
