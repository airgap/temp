import type { TsonHandlerModel } from 'from-schema';
import {
	attachmentMime,
	imageDraft,
	videoDraft,
	error,
	post,
	postDraft,
} from '@lyku/json-models';

export const draftPost = {
	request: {
		// title: 'Image Upload Authorization Request',
		description:
			'Upload a text/image/video post to BTV. You must be logged in to post.',
		type: 'object',
		properties: {
			body: {
				type: 'string',
				maxLength: 116_650,
				description: 'Max length of text post',
			},
			replyTo: post.properties.id,
			echoing: post.properties.id,
			attachments: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						type: attachmentMime,
						size: { type: 'integer' },
						filename: { type: 'string' },
					},
					required: ['type', 'size', 'filename'],
				},
			},
		},
		required: [],
	},
	response: {
		description:
			'Either the information you need to upload any attachments, or any errors encountered',
		type: 'object',
		properties: {
			id: {
				...postDraft.properties.id,
				description: "Your draft post's UUID",
			},
			imageDrafts: {
				type: 'array',
				items: imageDraft,
			},
			videoDrafts: {
				type: 'array',
				items: videoDraft,
			},
			error,
		},
		required: [],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
