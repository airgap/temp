import { FromBsonSchema, EnumBsonSchema, ObjectBsonSchema } from 'from-schema';
import { game } from './game';
import { bsonPrimitives } from 'from-schema';
const { string, double, uid } = bsonPrimitives;

export const achievementTier = {
	enum: ['tin', 'bronze', 'silver', 'gold', 'tritium'],
} as const satisfies EnumBsonSchema;

export const achievement = {
	bsonType: 'object',
	properties: {
		description: string,
		id: uid,
		icon: string,
		name: string,
		points: double,
		tier: achievementTier,
		game: game.properties.id,
	},
	required: ['id', 'name', 'points', 'icon'],
} as const satisfies ObjectBsonSchema;
export type Achievement = FromBsonSchema<typeof achievement>;
