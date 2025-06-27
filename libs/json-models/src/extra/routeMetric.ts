import type { ObjectTsonSchema, PostgresRecordModel } from 'from-schema';

export const routeMetric = {
	type: 'object',
	properties: {
		errorRate: { type: 'number' },
		inFlightRequests: { type: 'number' },
		lastUpdated: { type: 'number' },
		memoryUsage: { type: 'number' },
		requestRate: { type: 'number' },
		responseTime: { type: 'number' },
		service: { type: 'string' },
		status: { type: 'string', pattern: '^(up|down)$' },
		uptimeStats: {
			type: 'object',
			properties: {
				uptime24h: { type: 'number' },
				uptime7d: { type: 'number' },
				uptime30d: { type: 'number' },
				uptime90d: { type: 'number' },
				incidents24h: { type: 'number' },
				incidents7d: { type: 'number' },
				incidents30d: { type: 'number' },
				averageResponseTime24h: { type: 'number' },
				averageResponseTime7d: { type: 'number' },
			},
		},
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
} as const satisfies ObjectTsonSchema;
// console.log('videoDoc', videoDoc);
