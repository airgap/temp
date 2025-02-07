import type { TsonSchema } from 'from-schema';

export const email = {
	type: 'string',
	format: 'email',
} as const satisfies TsonSchema;
