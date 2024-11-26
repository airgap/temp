import { EnumBsonSchema, FromBsonSchema } from 'from-schema';

export const bounce = {
	enum: ['neither', 'edge', 'corner'],
} as const satisfies EnumBsonSchema;
export type Bounce = FromBsonSchema<typeof bounce>;
