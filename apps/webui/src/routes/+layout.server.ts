import { initDb } from '../lib/server/db.server.js';
import type { Cookies } from '@sveltejs/kit';

// Import environment variables, will be handled by our custom plugin
// during build time and runtime
import { PG_CONNECTION_STRING } from '$env/static/private';

export const load = async ({ cookies }: { cookies: Cookies }) => {
	const sessionId = cookies.get('sessionId');
	const db = initDb(
		PG_CONNECTION_STRING || process?.env?.PG_CONNECTION_STRING || ''
	);
	const session = sessionId
		? await db
				.selectFrom('sessions')
				.where('id', '=', sessionId)
				.selectAll()
				.executeTakeFirst()
		: undefined;
	const user = session
		? await db
				.selectFrom('users')
				.where('id', '=', session.userId)
				.selectAll()
				.executeTakeFirst()
		: undefined;
	return {
		session,
		user,
	};
};
