import { PostgresTableModel } from 'from-schema';
import { post } from '@lyku/bson-models';
import { updateUpdated } from '../updateUpdated';
export const posts = {
	indexes: [
		'publish',
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
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof post>;
