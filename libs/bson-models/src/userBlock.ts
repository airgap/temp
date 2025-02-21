import { idBond } from './idBond';

export const userBlock = {
	properties: {
		blockee: { type: 'bigint' },
		blocker: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		id: { ...idBond, primaryKey: true },
		updated: { type: 'timestamptz' },
	},
	required: ['blockee', 'blocker', 'created', 'id'],
} as const;
