import { groupName } from './groupName';
import { groupSlug } from './groupSlug';
import { bsonPrimitives } from 'from-schema';
const { bool, string, uid } = bsonPrimitives;
import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';

export const group = {
	bsonType: 'object',
	properties: {
		id: uid,
		name: groupName,
		slug: groupSlug,
		creator: uid,
		owner: uid,
		created: string,
		private: bool,
		thumbnail: uid,
		background: uid,
	},
	required: ['id', 'name', 'slug', 'owner', 'creator', 'created', 'private'],
} as const satisfies ObjectBsonSchema;
export type Group = FromBsonSchema<typeof group>;
