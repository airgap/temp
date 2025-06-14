import { encode, decode } from '@msgpack/msgpack';

export const load = async ({ params, parent, cookies }) => {
	console.log('Loading /hot');
	const { user } = await parent();
	console.log('Username:', user?.username);

	const start = Date.now();
	console.log('Start es req at', start);

	try {
		// Get session ID from cookies
		const sessionId = cookies.get('sessionId');

		// Make direct API call using the platform's fetch
		const res = await fetch('https://api.lyku.org/list-hot-posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-msgpack',
				...(sessionId ? { Authorization: `Bearer ${sessionId}` } : {}),
				'User-Agent': 'Mozilla/5.0 (compatible; Lyku/1.0; +https://lyku.org)',
			},
			body: encode({ page: 0 }),
		});

		if (!res.ok) {
			throw new Error(`API request failed: ${res.status} ${res.statusText}`);
		}

		const buffer = await res.arrayBuffer();
		const response = decode(new Uint8Array(buffer), {
			useBigInt64: true,
		}) as any;

		const end = Date.now();
		console.log('time', end - start);
		console.log('buffer', buffer.byteLength);
		console.log('response', response);

		// // Map the actual API response to the expected format
		const ret = {
			posts: response.posts || [],
			continuation: response.continuation || '',
			followers: response.followers || [],
			followees: response.followees || [],
			friendships: response.friendships || response.friends || [],
			reactions: response.reactions || [],
			users: response.users || response.authors || [],
			files: response.files || [],
		};
		console.log(
			'posts',
			response.posts,
			'continuation',
			response.continuation,
			'users',
			response.users,
			'friendships',
			response.friendships,
			'followers',
			response.followers,
			'followees',
			response.followees,
			'reactions',
			response.reactions,
			'files',
			response.files,
			'end',
		);
		return ret;
	} catch (error) {
		console.error('Failed to fetch hot posts:', error);
		// Return empty data on error
		return {
			posts: [],
			continuation: '',
			followers: [],
			followees: [],
			friendships: [],
			reactions: [],
			users: [],
			files: [],
		};
	}
};
