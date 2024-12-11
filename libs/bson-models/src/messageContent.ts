import { VarcharColumnModel } from 'from-schema';

export const messageContent = {
  type: 'varchar',
  minLength: 1,
  maxLength: 300,
} as const satisfies VarcharColumnModel;
