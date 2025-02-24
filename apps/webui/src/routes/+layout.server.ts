import type { ServerLoadEvent } from '@sveltejs/kit';
import { api, cookieAdapter, setStupidSessionId } from 'monolith-ts-api';

const getCurrentUserFromSession = async (sessionId: string) => {
	// Look up user by session ID
	const user = await api.getCurrentUser({});
	return user || undefined;
};

export async function load({ locals, cookies }: ServerLoadEvent) {
	const sessionId = cookies.get('sessionId');
	console.log('a sessionId', sessionId);
	setStupidSessionId(sessionId);
	// console.log('setter', cookieAdapter.set);
	// cookieAdapter.set?.('sessionId', sessionId);
	// Get user from session/token/etc
	const user = sessionId && (await getCurrentUserFromSession(sessionId));
	console.log('front end user', user);

	return {
		currentUser: user,
	};
}
