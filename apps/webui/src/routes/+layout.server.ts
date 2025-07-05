import { decode } from '@msgpack/msgpack';

export const load = async ({ cookies, fetch }) => {
	const sessionId = cookies.get('sessionId');
	console.log('sessionId', sessionId);
	// const db = initDb(
	// 	PG_CONNECTION_STRING || process?.env?.PG_CONNECTION_STRING || '',
	// );
	const user = await fetch('https://api.lyku.org/get-current-user')
		.then((res) => res.arrayBuffer())
		.then((buff) => decode(buff, { useBigInt64: true }))
		.catch((u) => undefined);
	console.log('Username', user?.username);
	return {
		sessionId,
		user,
		users: [user],
	};
};
