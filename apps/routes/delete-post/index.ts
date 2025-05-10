import { handleDeletePost } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { deleteFromElastic } from './elasticate';
import { client as pg } from '@lyku/postgres-client';

export default handleDeletePost(async (id, { requester, strings }) => {
	const post = await pg
		.selectFrom('posts')
		.select(['publish'])
		.where('id', '=', id)
		.where('author', '=', requester)
		.executeTakeFirst();

	if (!post) {
		throw new Err(404, strings.noPostByYou);
	}

	await pg
		.updateTable('posts')
		.where('id', '=', id)
		.set({ deleted: new Date() })
		.execute();
	await deleteFromElastic({ ...post, id });
});
