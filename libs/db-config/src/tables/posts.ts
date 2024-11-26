import { TableModel } from 'from-schema';
import { post } from 'bson-models';

export const posts = {
	indexes: [
		'published',
		'authorId',
		'likes',
		'loves',
		'groupId',
		'authorId',
		'replyTo',
		'echoing',
		'echoes',
	],
	schema: post,
} as const satisfies TableModel<typeof post>;
