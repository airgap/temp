import { idBond } from './idBond';

export const userBlock = {
	properties: {
		blockee: { type: 'bigint' },
		blocker: { type: 'bigint' },
		created: { type: 'timestamptz' },
		id: { ...idBond, primaryKey: true },
	},
	required: ['blockee', 'blocker', 'created', 'id'],
} as const;
