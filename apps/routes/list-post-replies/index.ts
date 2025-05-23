import { handleListPostReplies } from '@lyku/handles';
import { client as db } from '@lyku/postgres-client';

export default handleListPostReplies(async ({ id, before, tags }) => {
	let query = db
		.selectFrom('posts')
		.selectAll()
		.where('replyTo', '=', id)
		.orderBy('publish');
	if (before) query = query.where('publish', '<', before);
	if (tags && tags.length > 0) {
		query = query.where('hashtags', '&&', tags);
	}
	query = query.limit(20);

	const res = await query.execute();
	return res;
});
