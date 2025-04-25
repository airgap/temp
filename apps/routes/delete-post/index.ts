import { handleDeletePost } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { deleteFromElastic } from './elasticate';

export default handleDeletePost(async (id, { db, requester, strings }) => {
	const post = await db
		.selectFrom('posts')
		.select(['publish'])
		.where('id', '=', id)
		.where('author', '=', requester)
		.executeTakeFirst();

	if (!post) {
		throw new Err(404, strings.noPostByYou);
	}

	await db
		.updateTable('posts')
		.where('id', '=', id)
		.set({ deleted: new Date() })
		.execute();
	await deleteFromElastic({ ...post, id });
});
