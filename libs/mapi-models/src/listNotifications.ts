import type { TsonHandlerModel } from 'from-schema';
import { notification } from '@lyku/json-models';

export const listNotifications = {
	request: {
		type: 'object',
		properties: {
			limit: {
				type: 'integer',
				minimum: 1,
				maximum: 100,
				default: 20,
			},
			offset: {
				type: 'integer',
				minimum: 0,
				default: 0,
			},
		},
		required: [],
	},
	response: {
		type: 'object',
		properties: {
			notifications: {
				type: 'array',
				items: notification,
			},
			unreadCount: {
				type: 'integer',
				minimum: 0,
			},
			unclaimedCount: {
				type: 'integer',
				minimum: 0,
			},
		},
		required: ['notifications', 'unreadCount', 'unclaimedCount'],
	},
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
