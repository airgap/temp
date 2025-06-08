import type { TsonHandlerModel } from 'from-schema';
import { fileDoc, channelId } from '@lyku/json-models';

export const listChannelVideos = {
	request: {
		// title: 'Image Upload Authorization Request',
		description: 'List videos uploaded by a specific channel',
		type: 'object',
		properties: {
			channelId: {
				...channelId,
				description: 'The channel whose videos you want to list',
			},
		},
		required: ['channelId'],
	},
	response: {
		description: "The channel's videos",
		type: 'array',
		items: fileDoc,
	},
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
