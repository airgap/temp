import type { LayoutServerLoad } from './$types';
import { api, cookieAdapter, setStupidSessionId } from 'monolith-ts-api';

const getCurrentUserFromSession = async (sessionId: string) => {
	// Look up user by session ID
	const user = await api.getCurrentUser({});
	return user || undefined;
};

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const sessionId = cookies.get('sessionId');
	setStupidSessionId(sessionId);
	// console.log('setter', cookieAdapter.set);
	// cookieAdapter.set?.('sessionId', sessionId);
	// Get user from session/token/etc
	const user = sessionId && (await getCurrentUserFromSession(sessionId));
	console.log('front end user', user);

	return {
		currentUser: user,
	};
};
