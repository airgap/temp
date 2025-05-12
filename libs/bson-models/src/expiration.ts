import type { Timestamptz } from 'from-schema';

export const expiration = {
	type: 'timestamptz',
} as const satisfies Timestamptz;
