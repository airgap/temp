import { ObjectBsonSchema } from 'from-schema';
import { inventory } from './inventory';
import { bsonPrimitives } from 'from-schema';
const { double, uid } = bsonPrimitives;
// import { equipmentMap } from './equipmentMap';

export const player = {
	bsonType: 'object',
	properties: {
		id: uid,
		inventory,
		// equipment: equipmentMap,
		stats: {
			bsonType: 'object',
			properties: { armor: double, attack: double, health: double },
		},
	},
} satisfies ObjectBsonSchema;
