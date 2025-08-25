import type { PostgresRecordModel } from 'from-schema';
import { groupName } from './groupName';
import { groupSlug } from './groupSlug';

export const group = {
	properties: {
		id: {
			type: 'bigserial',
			primaryKey: true,
		},
		slug: groupSlug,
		lowerSlug: {
			type: 'varchar',
			maxLength: 20,
			pattern: '^[a-z0-9_]{3,20}$',
		},
		name: groupName,
		creator: { type: 'bigint' },
		owner: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		private: { type: 'boolean' },
		icon: { type: 'varchar', maxLength: 30 },
		background: { type: 'varchar', maxLength: 30 },
		updated: { type: 'timestamptz' },
		members: { type: 'bigint' },
		isolated: { type: 'timestamptz' },
		deleted: { type: 'timestamptz' },
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
		'members',
	],
} as const satisfies PostgresRecordModel;
