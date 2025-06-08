import type { TsonHandlerModel } from 'from-schema';
import { fileDoc } from '@lyku/json-models';

export const getVideo = {
	request: { type: 'bigint' },
	response: fileDoc,
	authenticated: false,
	throws: [400, 401, 404, 500],
} satisfies TsonHandlerModel;
