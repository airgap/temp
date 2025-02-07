import type { TsonHandlerModel } from 'from-schema';
import { cloudflareVideoDoc, channelId } from '@lyku/json-models';

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
		items: cloudflareVideoDoc,
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
