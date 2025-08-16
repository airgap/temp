import type { TsonHandlerModel } from 'from-schema';

export const markNotificationsRead = {
	request: {
		type: 'object',
		properties: {
			notificationIds: {
				type: 'array',
				items: { type: 'bigint' },
			},
		},
		required: [],
	},
	response: {
		type: 'object',
		properties: {
			success: { type: 'boolean' },
		},
		required: ['success'],
	},
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
