import { EnumJsonSchema } from "from-schema";

export const groupFilter = {
	enum: ['iCreated', 'iOwn', 'imIn'],
} as const satisfies EnumJsonSchema;