import { BigIntColumnModel } from 'from-schema';

export const userId = { type: 'bigint' } as const satisfies BigIntColumnModel;
