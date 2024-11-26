import { group } from './group';
import { user } from './user';
import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
import { idBond } from './idBond';
import { bsonPrimitives } from 'from-schema';
const { string } = bsonPrimitives;

export const groupMembership = {
	bsonType: 'object',
	properties: {
		id: idBond,
		group: group.properties.id,
		user: user.properties.id,
		created: string,
	},
	required: ['group', 'user', 'id', 'created'],
} as const satisfies ObjectBsonSchema;
export type GroupMembership = FromBsonSchema<typeof groupMembership>;
