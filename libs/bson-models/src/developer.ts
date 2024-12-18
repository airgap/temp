import {
	FromBsonSchema,
	ObjectBsonSchema,
	PostgresRecordModel,
	bsonPrimitives,
} from 'from-schema';

export const developer = {
	properties: {
		id: { type: 'bigint' },
		homepage: { type: 'text' },
		name: { type: 'text' },
		thumbnail: { type: 'text' },
	},
	required: ['id', 'name', 'homepage'],
} as const satisfies PostgresRecordModel;
export type Developer = FromBsonSchema<typeof developer>;
