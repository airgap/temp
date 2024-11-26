import { FromBsonSchema } from 'from-schema';
import { ObjectBsonSchema, bsonPrimitives } from 'from-schema';
const { double, int, string, uid } = bsonPrimitives;

export const cloudflareVideoWatermark = {
	bsonType: 'object',
	properties: {
		uid,
		size: double,
		height: int,
		width: int,
		created: string,
		downloadedFrom: string,
		name: string,
		opacity: double,
		padding: int,
		scale: double,
		position: string,
	},
	required: [
		'uid',
		'size',
		'height',
		'width',
		'created',
		'downloadedFrom',
		'name',
		'opacity',
		'padding',
		'scale',
		'position',
	],
} as const satisfies ObjectBsonSchema;
export type CloudflareVideoWatermark = FromBsonSchema<
	typeof cloudflareVideoWatermark
>;
