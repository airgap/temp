import { PostgresTableModel } from 'from-schema';
import { post } from 'bson-models';

export const posts = {
	indexes: [
		'published',
		'author',
		'likes',
		'loves',
		'group',
		'author',
		'replyTo',
		'echoing',
		'echoes',
	],
	schema: post,
} as const satisfies PostgresTableModel<typeof post>;
