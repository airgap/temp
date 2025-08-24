import { unpack, pack } from 'msgpackr';
import { api } from '@lyku/monolith-ts-api';
export const load = async ({ params, fetch, parent }) => {
	const { user } = await parent();
	const slug = params.slug?.toLowerCase();
	const body = pack([slug]);
	console.log('body', body);
	const res = await fetch('https://api.lyku.org/get-groups', {
		method: 'POST',
		body,
	});
	console.log('Res ok?', res.ok);
	if (!res.ok) {
		throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	}

	const buffer = await res.arrayBuffer();
	const response = unpack(new Uint8Array(buffer)) as any;
	console.log('get-groups response', response);
	const [group] = response.groups;
	const posts = group
		? await fetch('https://api.lyku.org/list-feed-posts', {
				method: 'POST',
				body: pack({ groups: [group.id] }),
			})
				.then((res) => res.arrayBuffer())
				.then((buffer) => unpack(new Uint8Array(buffer)))
		: [];

	return { ...response, posts };
};
