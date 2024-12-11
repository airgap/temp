import { CharColumnModel } from 'from-schema';

export const uuidv4 = {
  type: 'char',
  length: 36,
  pattern:
    '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  description: 'UUID v4 (36 character hex string)',
} as const satisfies CharColumnModel;

export const uuidv5 = {
  type: 'char',
  length: 36,
  pattern:
    '^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  description: 'UUID v5 (36 character hex string)',
} as const satisfies CharColumnModel;
