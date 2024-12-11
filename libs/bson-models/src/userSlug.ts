import { TextColumnModel } from 'from-schema';

export const userSlug = {
  type: 'text',
  pattern: '^[a-z0-9$_]{2,20}$',
  minLength: 2,
  maxLength: 20,
} as const satisfies TextColumnModel;
