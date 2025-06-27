import { unpack, pack } from 'msgpackr';
export const load = async ({ params, fetch, parent }) => {
	const body = pack({ user: params.username?.toLocaleLowerCase() });
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
	const response = unpack(new Uint8Array(buffer)) as any;

	return response;
};
