import type { EnumColumnModel, PostgresRecordModel } from 'from-schema';
import { game } from './game';

export const achievementTier = {
	type: 'enum',
	enum: ['tin', 'bronze', 'silver', 'gold', 'tritium'],
} as const satisfies EnumColumnModel;

export const achievement = {
	properties: {
		description: { type: 'text' },
		id: { type: 'bigint', primaryKey: true },
		icon: { type: 'text', minLength: 1, maxLength: 100 },
		name: { type: 'text', minLength: 1, maxLength: 100 },
		points: { type: 'integer' },
		tier: achievementTier,
		game: { type: 'integer' },
	},
	required: ['id', 'name', 'points', 'icon'],
} as const satisfies PostgresRecordModel;
