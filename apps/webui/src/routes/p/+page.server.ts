import { unpack, pack } from 'msgpackr';
export const load = async ({ params, fetch, parent }) => {
	const body = pack({});
	console.log('body', body);
	const res = await fetch('https://api.lyku.org/list-games', {
		method: 'POST',
		body,
	});
	console.log('Res ok?', res.ok);
	if (!res.ok) {
		throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	}

	const buffer = await res.arrayBuffer();
	const response = unpack(new Uint8Array(buffer)) as any;
	console.log('response', response);

	return response;
};
