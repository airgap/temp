// import { initDb } from '../lib/server/db.server.js';
import type { Cookies } from '@sveltejs/kit';

// Import environment variables, will be handled by our custom plugin
// during build time and runtime
import { PG_CONNECTION_STRING } from '$env/static/private';
import { initRedis } from '../initRedis.server';
import { neon } from '../lib/server';
import { parseBON, parsePossibleBON, stringifyBON } from 'from-schema';
import type { User } from '@lyku/json-models';
import { decode } from '@msgpack/msgpack';

export const load = async ({ cookies, fetch }) => {
	const sessionId = cookies.get('sessionId');
	console.log('sessionId', sessionId);
	// const db = initDb(
	// 	PG_CONNECTION_STRING || process?.env?.PG_CONNECTION_STRING || '',
	// );
	const user = await fetch('https://api.lyku.org/get-current-user')
		.then((res) => res.arrayBuffer())
		.then((buff) => decode(buff, { useBigInt64: true }));
	console.log('Username', user?.username);
	return {
		sessionId,
		user,
		users: [],
	};
};
