import type { PostgresRecordModel } from 'from-schema';
import { gameStatus } from './gameStatus';

export const game = {
	properties: {
		background: { type: 'text' },
		developer: { type: 'integer' },
		homepage: { type: 'text' },
		icon: { type: 'text' },
		id: { type: 'integer', primaryKey: true },
		publisher: { type: 'integer' },
		thumbnail: { type: 'text' },
		title: { type: 'text' },
		description: { type: 'text' },
		status: gameStatus,
		nsfw: { type: 'boolean' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: {
			type: 'timestamptz',
			generated: { always: true, as: 'CURRENT_TIMESTAMP' },
		},
	},
	required: ['developer', 'id', 'title', 'status', 'nsfw', 'created'],
} as const satisfies PostgresRecordModel;
