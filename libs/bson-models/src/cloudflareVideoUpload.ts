import { cloudflareVideoWatermark } from './cloudflareVideoWatermark';
import { ObjectJsonSchema } from 'from-schema';

export const cloudflareVideoUpload = {
	type: 'object',
	properties: {
		allowedOrigins: {
			type: 'array',
			items: { type: 'string' },
		},
		created: { type: 'string' },
		duration: { type: 'number' },
		input: {
			type: 'object',
			properties: {
				width: { type: 'integer' },
				height: { type: 'integer' },
			},
			required: ['width', 'height'],
		},
		maxDurationSeconds: { type: 'number' },
		// meta: {
		// 	type: 'object',
		// 	properties: {}
		// },
		modified: { type: 'string' },
		uploadExpiry: { type: 'string' },
		playback: {
			type: 'object',
			properties: {
				hls: { type: 'string' },
				dash: { type: 'string' },
			},
			required: ['hls', 'dash'],
		},
		preview: { type: 'string' },
		readyToStream: { type: 'boolean' },
		requireSignedURLs: { type: 'boolean' },
		size: { type: 'integer' },
		status: {
			type: 'object',
			properties: {
				state: { type: 'string' },
				pctComplete: { type: 'string' },
				errorReasonCode: { type: 'string' },
				errorReasonText: { type: 'string' },
			},
			required: ['state', 'pctComplete', 'errorReasonCode', 'errorReasonText'],
		},
		thumbnail: { type: 'string' },
		thumbnailTimestampPct: { type: 'number' },
		creator: { type: 'string' },
		uid: { type: 'string' },
		liveInput: { type: 'string' },
		uploaded: { type: 'string' },
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
} as const satisfies ObjectJsonSchema;
