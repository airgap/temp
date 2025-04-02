import type { TsonHandlerModel } from 'from-schema';
import { imageDraft } from '@lyku/json-models';

export const confirmImageUpload = {
	request: imageDraft.properties.id,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
