import type { TsonHandlerModel } from 'from-schema';
import { cloudflareVideoDoc } from '@lyku/json-models';

export const getVideo = {
	request: { type: 'bigint' },
	response: cloudflareVideoDoc,
} satisfies TsonHandlerModel;
