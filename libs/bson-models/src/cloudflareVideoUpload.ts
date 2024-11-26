import { cloudflareVideoWatermark } from './cloudflareVideoWatermark';
import { ObjectBsonSchema, bsonPrimitives } from 'from-schema';
const { uid, bool, double, int, string } = bsonPrimitives;

export const cloudflareVideoUpload = {
	bsonType: 'object',
	properties: {
		allowedOrigins: {
			bsonType: 'array',
			items: string,
		},
		created: string,
		duration: double,
		input: {
			bsonType: 'object',
			properties: {
				width: int,
				height: int,
			},
			required: ['width', 'height'],
		},
		maxDurationSeconds: double,
		// meta: {
		// 	type: 'object',
		// 	properties: {}
		// },
		modified: string,
		uploadExpiry: string,
		playback: {
			bsonType: 'object',
			properties: {
				hls: string,
				dash: string,
			},
			required: ['hls', 'dash'],
		},
		preview: string,
		readyToStream: bool,
		requireSignedURLs: bool,
		size: int,
		status: {
			bsonType: 'object',
			properties: {
				state: string,
				pctComplete: string,
				errorReasonCode: string,
				errorReasonText: string,
			},
			required: [
				'state',
				'pctComplete',
				'errorReasonCode',
				'errorReasonText',
			],
		},
		thumbnail: string,
		thumbnailTimestampPct: double,
		creator: uid,
		uid,
		liveInput: uid,
		uploaded: string,
		watermark: cloudflareVideoWatermark,
	},
	required: [
		'allowedOrigins',
		'created',
		'duration',
		'input',
		'maxDurationSeconds',
		'meta',
		'modified',
		'uploadExpiry',
		'playback',
		'preview',
		'readyToStream',
		'requireSignedURLs',
		'size',
		'status',
		'thumbnail',
		'thumbnailTimestampPct',
		'creator',
		'uid',
		'liveInput',
		'uploaded',
		'watermark',
	],
} as const satisfies ObjectBsonSchema;
