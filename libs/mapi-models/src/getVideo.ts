import type { TsonHandlerModel } from 'from-schema';
import { videoDoc } from '@lyku/json-models';

export const getVideo = {
	request: { type: 'bigint' },
	response: videoDoc,
	authenticated: false,
	throws: [400, 401, 404, 500],
} satisfies TsonHandlerModel;
