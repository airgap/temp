import { DateColumnModel } from 'from-schema';

export const expiration = {
  type: 'date',
} as const satisfies DateColumnModel;
