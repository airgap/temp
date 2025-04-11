import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	// Check if sessionid cookie exists
	const sessionId = cookies.get('sessionid');

	// Redirect based on the presence of the sessionid cookie
	if (sessionId) {
		throw redirect(302, '/fyp');
	} else {
		throw redirect(302, '/hot');
	}
}
