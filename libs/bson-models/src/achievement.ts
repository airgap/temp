import { PostgresRecordModel, EnumColumnModel } from 'from-schema';
import { game } from './game';

export const achievementTier = {
	type: 'enum',
	enum: ['tin', 'bronze', 'silver', 'gold', 'tritium'],
} as const satisfies EnumColumnModel;

export const achievement = {
	properties: {
		description: { type: 'text' },
		id: { type: 'bigint' },
		icon: { type: 'text', minLength: 1, maxLength: 100 },
		name: { type: 'text', minLength: 1, maxLength: 100 },
		points: { type: 'double precision' },
		tier: achievementTier,
		game: game.properties.id,
	},
	required: ['id', 'name', 'points', 'icon'],
} as const satisfies PostgresRecordModel;
