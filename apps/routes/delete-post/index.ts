import { handleDeletePost } from '@lyku/handles';

export default handleDeletePost(async (id, { db, requester, strings }) => {
	const post = await db
		.selectFrom('posts')
		.where('id', '=', id)
		.where('author', '=', requester)
		.executeTakeFirst();

	if (!post) {
		throw new Error(strings.noPostByYou);
	}

	await db.deleteFrom('posts').where('id', '=', id).execute();
});
