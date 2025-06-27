import { handleDeletePost } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { deleteFromElastic } from './elasticate';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { type Post } from '@lyku/json-models';
import { pack, unpack } from 'msgpackr';

export default handleDeletePost(async (id, { requester, strings, now }) => {
	let post = await redis.getBuffer(`post:${id}`).then((p) => p && unpack(p));
	post ||= await pg
		.selectFrom('posts')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();

	if (!post) {
		throw new Err(404, strings.noPostByYou);
	}
	console.log('Author', post.author, 'Requester', requester);
	if (post.author !== requester) throw new Err(403, 'Nice try, motherfucker!');
	await pg
		.updateTable('posts')
		.where('id', '=', id)
		.set({ deleted: now })
		.execute();
	await redis.set(`post:${id}`, pack({ ...post, deleted: now }));
	await deleteFromElastic({ ...post, id });
});
