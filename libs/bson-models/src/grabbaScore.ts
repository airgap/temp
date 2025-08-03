import { PostgresRecordModel } from 'from-schema';

export const grabbaScore = {
	properties: {
		bits: {
			type: 'integer',
			minimum: 0,
		},
		bytes: {
			type: 'integer',
			minimum: 0,
		},
		score: {
			type: 'integer',
			minimum: 0,
		},
		time: {
			type: 'double precision',
			minimum: 0,
		},
		start: {
			type: 'date',
		},
		finish: {
			type: 'date',
		},
	},
	required: ['bits', 'bytes', 'score', 'time'],
} satisfies PostgresRecordModel;
