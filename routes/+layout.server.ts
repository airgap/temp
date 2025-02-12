import { db } from '@lyku/route-helpers';

const getCurrentUserFromSession = async (locals) => {
	// Get session ID from request bearer
	const sessionId = locals.sessionId;
	if (!sessionId) return undefined;

	// Look up user by session ID
	const user = await db.users.findOne({ sessionId });
	return user || undefined;
};

export async function load({ locals }) {
	// Get user from session/token/etc
	const user = await getCurrentUserFromSession();

	return {
		currentUser: user,
	};
}
