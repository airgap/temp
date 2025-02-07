import type { TsonHandlerModel } from 'from-schema';

export const listenToPostCount = {
	response: { type: 'bigint' },
	stream: true,
	authenticated: false,
} as const satisfies TsonHandlerModel;
