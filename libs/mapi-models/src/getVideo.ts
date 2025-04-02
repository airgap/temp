import type { TsonHandlerModel } from 'from-schema';
import { cloudflareVideoDoc } from '@lyku/json-models';

export const getVideo = {
	request: { type: 'bigint' },
	response: cloudflareVideoDoc,
	authenticated: false,
	throws: [400, 401, 404, 500],
} satisfies TsonHandlerModel;
