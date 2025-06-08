import type { TsonHandlerModel } from 'from-schema';
import { fileDoc } from '@lyku/json-models';

export const getFile = {
	request: {
		type: 'object',
		properties: { file: { type: 'bigint' }, wait: { type: 'boolean' } },
		required: ['file'],
	},
	response: fileDoc,
	authenticated: true,
	throws: [400, 401, 404, 409, 500],
} as const satisfies TsonHandlerModel;
