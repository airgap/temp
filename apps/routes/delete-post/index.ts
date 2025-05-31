import { handleDeletePost } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { deleteFromElastic } from './elasticate';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { parsePossibleBON, stringifyBON } from 'from-schema';
import { type Post } from '@lyku/json-models';

export default handleDeletePost(async (id, { requester, strings, now }) => {
	let post = await redis.get(`post:${id}`).then(parsePossibleBON<Post>);
	post ??= await pg
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
	await redis.set(`post:${id}`, stringifyBON({ ...post, deleted: now }));
	await deleteFromElastic({ ...post, id });
});
