import { base58ToBigint, Err } from '@lyku/helpers';
import { neon } from '../../lib/server/db.server';
import { decode, encode } from '@msgpack/msgpack';

export const load = async ({ params, fetch, parent }: any) => {
	const { user } = await parent();
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
	console.log('Bigint id', big.toString());
	const body = encode({ post: big }, { useBigInt64: true });
	console.log('body', body);
	const res = fetch('https://api.lyku.org/get-thread-for-post', {
		method: 'POST',
		body,
	})
		.then((res) => res.arrayBuffer())
		.then((buff) => decode(buff, { useBigInt64: true }));

	return res;
};
