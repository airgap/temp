import { cloudflareVideoDoc } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getVideos = {
	request: { type: 'array', items: { type: 'bigint' } },
	response: { type: 'array', items: cloudflareVideoDoc },
} satisfies TsonHandlerModel;
