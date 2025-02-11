import type { BigIntColumnModel } from 'from-schema';

export const channelId = {
	type: 'bigint',
} as const satisfies BigIntColumnModel;
