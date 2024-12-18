import { cloudflareVideoDoc } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getVideo = {
	request: { type: 'bigint' },
	response: cloudflareVideoDoc,
} satisfies TsonHandlerModel;
