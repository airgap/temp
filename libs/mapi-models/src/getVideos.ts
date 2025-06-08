import type { TsonHandlerModel } from 'from-schema';
import { fileDoc } from '@lyku/json-models';

export const getVideos = {
	request: { type: 'array', items: { type: 'bigint' } },
	response: { type: 'array', items: fileDoc },
	authenticated: false,
	throws: [400, 401, 404, 500],
} satisfies TsonHandlerModel;
