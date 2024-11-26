import { HandlerModel } from 'from-schema';
import { imageDraft } from '@lyku/json-models';

export const confirmImageUpload = {
	request: imageDraft.properties.id,
	authenticated: true,
} as const satisfies HandlerModel;
