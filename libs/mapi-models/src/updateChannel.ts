import {
	channelName,
	hex,
	channel,
	tagline,
	bio,
	userId,
} from '@lyku/json-models';
import { TsonHandlerModel, ObjectTsonSchema } from 'from-schema';
const properties = {
	fgColor: hex,
	bgColor: hex,
	tvColor: hex,
	id: { type: 'bigint' },
	owner: userId,
	name: channelName,
	tagline,
	bio,
} as const;
const request = {
	type: 'object',
	properties,
	required: ['id'],
} as const satisfies ObjectTsonSchema;
export const updateChannel = {
	request,
	response: channel,
	authenticated: true,
} as const satisfies TsonHandlerModel;
