import { EnumBsonSchema, FromBsonSchema } from 'from-schema';

export const gameStatus = {
	enum: [
		// General Availability
		'ga',
		// Work in Progress, unplayable
		'wip',
		// Down for maintenance
		'maintenance',
		// Early Access, playable but unstable
		'ea',
		// Planned but not under development yet
		'planned',
	],
} as const satisfies EnumBsonSchema;
export type GameStatus = FromBsonSchema<typeof gameStatus>;
