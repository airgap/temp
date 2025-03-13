import { initDb } from '../lib/server/db.server.js';
import type { Cookies } from '@sveltejs/kit';

// Import environment variables, will be handled by our custom plugin
// during build time and runtime
import { DATABASE_URL } from '$env/static/private';

export const load = async ({ cookies }: { cookies: Cookies }) => {
	const sessionId = cookies.get('sessionId');
	const db = initDb(DATABASE_URL || process?.env?.DATABASE_URL || '');
	const session = sessionId
		? await db
				.selectFrom('sessions')
				.where('id', '=', sessionId)
				.selectAll()
				.executeTakeFirst()
				.catch((e) => console.log(e.name, e.message, e))
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
