import { EnumColumnModel } from 'from-schema';

export const imageUploadReason = {
	type: 'enum',
	enum: [
		'PostAttachment',
		'ChannelLogo',
		'ProfilePicture',
		'ActiveChannelBackground',
		'AwayChannelBackground',
	],
} as const satisfies EnumColumnModel;
