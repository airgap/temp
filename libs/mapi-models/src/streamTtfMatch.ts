import { ttfMatch } from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';

export const streamTtfMatch = {
	request: {
		type: 'object',
		properties: {
			id: { type: 'bigint' },
		},
		required: ['id'],
	},
	response: {
		type: 'object',
		properties: {
			match: ttfMatch,
		},
	},
	authenticated: true,
	stream: true,
} as const satisfies TsonHandlerModel;
