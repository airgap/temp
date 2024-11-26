import { HandlerModel } from 'from-schema';
import { imageUploadReason } from '@lyku/json-models';
import { sessionId } from '@lyku/json-models';
import { jsonPrimitives } from 'from-schema';

const { uid, string } = jsonPrimitives;

const request = {
	// title: 'Image Upload Authorization Request',
	description:
		"Request permission to upload an image. You must be logged in as the channel's owner.",
	type: 'object',
	properties: {
		sessionId: {
			...sessionId,
			description: "You must be logged in as the channel's owner",
		},
		channelId: {
			...uid,
			description: 'The channel whose logo you are looking to replace',
		},
		reason: imageUploadReason,
	},
	required: ['reason'],
} as const;

const response = {
	description:
		'Either the information you need to upload an image, or any errors encountered',
	type: 'object',
	properties: {
		id: { ...string, description: 'Cloudflare Images draft upload ID' },
		url: { ...string, description: 'URL to upload your image to' },
	},
	required: ['id', 'url'],
} as const;
export const authorizeImageUpload = {
	request,
	response,
	authenticated: true,
} as const satisfies HandlerModel;
