import { CharColumnModel } from 'from-schema';

export const emptyResponse = {
  type: 'character',
  length: 0,
} as const satisfies CharColumnModel;
