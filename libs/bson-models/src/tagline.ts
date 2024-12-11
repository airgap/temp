import { VarcharColumnModel } from 'from-schema';

export const tagline = {
  type: 'varchar',
  minLength: 0,
  maxLength: 255,
} as const satisfies VarcharColumnModel;
