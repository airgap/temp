import { EnumBsonSchema } from 'from-schema';

export const operation = {
	enum: ['add', 'subtract', 'multiply', 'divide'],
} as const satisfies EnumBsonSchema;
