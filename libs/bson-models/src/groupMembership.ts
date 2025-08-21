import { idBond } from './idBond';
import type { PostgresRecordModel } from 'from-schema';
import { groupPermissions } from '@lyku/helpers';

export const groupMembership = {
	properties: {
		group: { type: 'bigint' },
		user: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		permissions: {
			type: 'array',
			items: {
				type: 'text',
				enum: groupPermissions,
			},
		},
	},
	required: ['group', 'user', 'id', 'created', 'updated', 'permissions'],
} as const satisfies PostgresRecordModel;
