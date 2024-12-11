import { CharColumnModel } from 'from-schema';

export const ttfBoard = {
  type: 'char',
  pattern: '^[XO-]{9}$',
  length: 9,
} as const satisfies CharColumnModel;
