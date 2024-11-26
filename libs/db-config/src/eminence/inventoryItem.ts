import { ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
import { equipmentSlot } from './equipmentSlot';
const { uid, bool, string } = bsonPrimitives;


export const inventoryItem = {
	bsonType: 'object',
	properties: {
		id: uid,
		placeable: bool,
		slots: {
			bsonType: 'array',
			items: equipmentSlot,
		},
		name: string,
	},
	required: ['id', 'name'],
} as const satisfies ObjectBsonSchema;
