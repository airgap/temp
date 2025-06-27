import type { PostgresRecordModel } from 'from-schema';

export const routeStatus = {
	properties: {
		errorRate: { type: 'double precision' },
		inFlightRequests: { type: 'double precision' },
		lastUpdated: { type: 'double precision' },
		memoryUsage: { type: 'double precision' },
		requestRate: { type: 'double precision' },
		responseTime: { type: 'double precision' },
		service: { type: 'text' },
		status: { type: 'text', pattern: '^(up|down)$' },
	},
	required: [
		'errorRate',
		'inFlightRequests',
		'lastUpdated',
		'memoryUsage',
		'requestRate',
		'responseTime',
		'service',
		'status',
	],
} as const satisfies PostgresRecordModel;
// console.log('videoDoc', videoDoc);
