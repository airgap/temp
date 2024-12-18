import { BigIntColumnModel } from 'from-schema';

export const channelId = {
	type: 'bigint',
} as const satisfies BigIntColumnModel;
