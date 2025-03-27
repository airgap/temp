// import type { PageLoad } from './$types';
import { api, setFetch } from 'monolith-ts-api';
import { base58ToBigint, Err } from '@lyku/helpers';
import { neon } from '../../lib/server/db.server';

export const load = async ({ params, fetch }: any) => {
	const db = neon();
	const postId = params.post;
	console.log('params', params);
	console.log('postId', postId);
	if (
		!/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(
			postId,
		)
	)
		throw new Err(404, 'Not a valid post or page');
	const big = base58ToBigint(postId);
	console.log('big', big);
	const post = await db
		.selectFrom('posts')
		.where('id', '=', big)
		.selectAll()
		.executeTakeFirst();
	if (!post) throw new Err(404, 'Post not found');
	console.log('got post', typeof post.id, '!', post.body);
	console.log('attachments', post.attachments);

	const author = await db
		.selectFrom('users')
		.where('id', '=', post.author)
		.selectAll()
		.executeTakeFirstOrThrow();
	return {
		post,
		users: [author],
	};
};
