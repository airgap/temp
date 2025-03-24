import { handleDeletePost } from '@lyku/handles';
import { Err } from '@lyku/helpers';

export default handleDeletePost(async (id, { db, requester, strings }) => {
	const post = await db
		.selectFrom('posts')
		.where('id', '=', id)
		.where('author', '=', requester)
		.executeTakeFirst();

	if (!post) {
		throw new Err(404, strings.noPostByYou);
	}

	await db.deleteFrom('posts').where('id', '=', id).execute();
});
