import { TsonHandlerModel } from 'from-schema';
import { imageDraft, imageUploadReason } from '@lyku/json-models';
import { sessionId } from '@lyku/json-models';

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
			type: 'bigint',
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
		id: imageDraft.properties.id,
		url: imageDraft.properties.uploadURL,
	},
	required: ['id', 'url'],
} as const;
export const authorizeImageUpload = {
	request,
	response,
	authenticated: true,
} as const satisfies TsonHandlerModel;
