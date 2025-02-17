import type { PostgresRecordModel } from 'from-schema';
import { gameStatus } from './gameStatus';

export const game = {
	properties: {
		background: { type: 'text' },
		developer: { type: 'text' },
		homepage: { type: 'text' },
		icon: { type: 'text' },
		id: { type: 'integer', primaryKey: true },
		publisher: { type: 'text' },
		thumbnail: { type: 'text' },
		title: { type: 'text' },
		description: { type: 'text' },
		status: gameStatus,
		nsfw: { type: 'boolean' },
	},
	required: ['id', 'title', 'status', 'nsfw'],
} as const satisfies PostgresRecordModel;
