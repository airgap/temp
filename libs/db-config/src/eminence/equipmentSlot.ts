import { EnumBsonSchema } from "from-schema";

export const equipmentSlot = {
	enum: ['head', 'neck', 'arm', 'chest', 'legs', 'feet', 'hand'],
} as const satisfies EnumBsonSchema;