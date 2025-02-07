import type { TsonHandlerModel } from 'from-schema';
import { cloudflareVideoDoc } from '@lyku/json-models';

export const getVideos = {
	request: { type: 'array', items: { type: 'bigint' } },
	response: { type: 'array', items: cloudflareVideoDoc },
} satisfies TsonHandlerModel;
