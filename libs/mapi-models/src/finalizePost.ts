import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { post } from '@lyku/json-models';

const { string } = jsonPrimitives;

export const finalizePost = {
	request: {
		type: 'object',
		properties: {
			id: { type: 'bigint' },
			body: string,
		},
		required: ['id'],
	},
	response: post,
	authenticated: true,
} as const satisfies TsonHandlerModel;
