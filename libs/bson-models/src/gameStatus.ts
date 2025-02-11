import type { EnumColumnModel } from 'from-schema';

export const gameStatus = {
	type: 'enum',
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
} as const satisfies EnumColumnModel;
