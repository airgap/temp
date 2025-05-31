import { base58ToBigint, Err } from '@lyku/helpers';
import { neon } from '../../lib/server/db.server';
import { decode, encode } from '@msgpack/msgpack';

export const load = async ({ params, fetch, parent }: any) => {
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
	const res = fetch('https://api.lyku.org/get-thread-for-post', {
		type: 'POST',
		body: encode({ post: big }),
	})
		.then((res) => res.arrayBuffer())
		.then((buff) => decode(buff, { useBigInt64: true }));

	return res;
};
