export const gameSession = {
	type: 'object',
	properties: {
		time: {
			type: 'number',
			minimum: 0,
		},
		edges: {
			type: 'number',
			minimum: 0,
		},
		corners: {
			type: 'number',
			minimum: 0,
		},
	},
	required: ['time', 'edges', 'corners'],
} as const;
