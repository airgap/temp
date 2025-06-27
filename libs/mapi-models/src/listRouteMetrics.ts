import type { TsonHandlerModel } from 'from-schema';
import { routeMetric } from '@lyku/json-models';

export const listRouteMetrics = {
	request: {
		type: 'object',
		properties: {
			route: { type: 'string', maxLength: 50 },
		},
		required: [],
	},
	response: {
		type: 'array',
		items: routeMetric,
	},
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
