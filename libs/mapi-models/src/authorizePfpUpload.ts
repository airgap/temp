import type { TsonHandlerModel } from 'from-schema';
import { imageDraft, imageUploadReason, sessionId } from '@lyku/json-models';

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
export const authorizePfpUpload = {
	response,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
