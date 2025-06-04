import { decode, encode } from '@msgpack/msgpack';
export const load = async ({ params, fetch, parent }) => {
	const body = encode({ user: params.slug }, { useBigInt64: true });
	console.log('body', body);
	const res = await fetch('https://api.lyku.org/list-user-posts-with-meta', {
		method: 'POST',
		body,
	});
	console.log('Res ok?', res.ok);
	if (!res.ok) {
		throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	}

	const buffer = await res.arrayBuffer();
	const response = decode(new Uint8Array(buffer), {
		useBigInt64: true,
	}) as any;

	return response;
};
