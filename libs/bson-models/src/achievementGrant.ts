import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { uid, string } = bsonPrimitives;
import { user } from './user';
import { achievement } from './achievement';
import { game } from './game';

export const achievementGrant = {
	bsonType: 'object',
	properties: {
		id: uid,
		achievement: achievement.properties.id,
		user: user.properties.id,
		granted: string,
		game: game.properties.id,
	},
	required: ['id', 'name', 'points', 'granted'],
} as const satisfies ObjectBsonSchema;
export type GrantedAchievement = FromBsonSchema<typeof achievementGrant>;
