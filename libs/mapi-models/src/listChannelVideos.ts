import { cloudflareVideoUpload } from '@lyku/json-models';
import { HandlerModel, jsonPrimitives } from 'from-schema';

const { uid } = jsonPrimitives;

export const listChannelVideos = {
	request: {
		// title: 'Image Upload Authorization Request',
		description: 'List videos uploaded by a specific channel',
		type: 'object',
		properties: {
			channelId: {
				...uid,
				description: 'The channel whose videos you want to list',
			},
		},
		required: ['channelId'],
	},
	response: {
		description: "The channel's videos",
		type: 'array',
		items: cloudflareVideoUpload,
	},
	authenticated: false,
} as const satisfies HandlerModel;
