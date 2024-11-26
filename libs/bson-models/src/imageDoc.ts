import { FromBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { string, bool, date, uid } = bsonPrimitives;
import { ObjectBsonSchema } from 'from-schema';

export const imageDoc = {
	bsonType: 'object',
	properties: {
		id: uid,
		// metadata: {
		// 	type: 'object',
		// 	properties: {},
		// },
		uploaded: date,
		requireSignedURLs: bool,
		variants: {
			bsonType: 'array',
			items: string,
		},
		draft: true,
		channelId: uid,
		supertype: 'image',
	},
	required: [
		'id',
		'metadata',
		'uploaded',
		'requireSignedURLs',
		'variants',
		'supertype',
	],
} as const satisfies ObjectBsonSchema;
export type ImageDoc = FromBsonSchema<typeof imageDoc>;
