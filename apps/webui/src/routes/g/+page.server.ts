import { unpack, pack } from 'msgpackr';
import { api } from '@lyku/monolith-ts-api';
export const load = async ({ params, fetch, parent }) => {
	const { user } = await parent();

	return await fetch(
		`https://api.lyku.org/list-groups${user ? '' : '-unauthenticated'}`,
		{ body: pack({}), method: 'POST' },
	)
		.then((res) => res.arrayBuffer())
		.then((buffer) => unpack(new Uint8Array(buffer)));
};
