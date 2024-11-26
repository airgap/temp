import { attachmentMime } from '@lyku/json-models';
import { attachmentDraft } from '@lyku/json-models';
import { error } from '@lyku/json-models';
import { post } from '@lyku/json-models';
import { postDraft } from '@lyku/json-models';
import { HandlerModel } from 'from-schema';

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
					},
					required: ['type', 'size'],
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
			attachmentUploadPacks: {
				type: 'array',
				description:
					'A list of links to upload your attachments to + attachment draft UIDs',
				items: attachmentDraft,
				maxLength: 10,
			},
			error,
		},
		required: [],
	},
	authenticated: true,
} as const satisfies HandlerModel;
