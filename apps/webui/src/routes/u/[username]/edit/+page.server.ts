import { redirect } from '@sveltejs/kit';
import { unpack, pack } from 'msgpackr';

export const load = async ({ params, fetch, parent }) => {
	// Get the current user from the parent layout
	const parentData = await parent();
	const currentUser = parentData?.user;

	// If user is logged in and trying to edit someone else's profile, redirect
	if (currentUser && currentUser.slug !== params.username?.toLowerCase()) {
		throw redirect(302, `/u/${currentUser.username}/edit`);
	}

	// Load user data for the profile being edited
	const body = pack(params.username?.toLowerCase());
	const res = await fetch('https://api.lyku.org/get-user-by-name', {
		method: 'POST',
		body,
	});

	if (!res.ok) {
		throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	}

	const buffer = await res.arrayBuffer();
	const response = unpack(new Uint8Array(buffer)) as any;

	return response;
};
