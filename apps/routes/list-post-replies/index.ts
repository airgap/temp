import { handleListPostReplies } from '@lyku/handles';
import { sql } from 'kysely';

export default handleListPostReplies(async ({ id, before, tags }, { db }) => {
	let query = db
		.selectFrom('posts')
		.selectAll()
		.where('replyTo', '=', id)
		.orderBy('published');
	if (before) query = query.where('published', '<', before);
	if (tags && tags.length > 0) {
		query = query.where('hashtags', '&&', tags);
	}
	query = query.limit(20);

	const res = await query.execute();
	return res;
});
