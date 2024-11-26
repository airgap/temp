import { EnumBsonSchema, FromBsonSchema } from 'from-schema';

export const imageUploadReason = {
	enum: [
		'PostAttachment',
		'ChannelLogo',
		'ProfilePicture',
		'ActiveChannelBackground',
		'AwayChannelBackground',
	],
} as const satisfies EnumBsonSchema;
export type ImageUploadReason = FromBsonSchema<typeof imageUploadReason>;
