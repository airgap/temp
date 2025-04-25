import { ObjectTsonSchema } from 'from-schema';

export const thread = {
	title: 'Thread',
	type: 'object',
	properties: {
		focus: {
			type: 'bigint',
		},
		replyTo: {
			type: 'bigint',
		},
		replies: {
			type: 'array',
			items: { $ref: '.' },
		},
	},
	required: ['focus'],
	additionalProperties: false,
} as const satisfies ObjectTsonSchema;
