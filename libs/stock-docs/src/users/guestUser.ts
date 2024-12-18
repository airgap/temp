import { User } from '@lyku/json-models';
export const guestUser = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 1n,
	joined: new Date('2024-01-20T05:36:36.888Z'),
	lastLogin: new Date('2024-01-20T05:36:36.888Z'),
	live: false,
	postCount: 0n,
	username: 'lykuGuest',
	profilePicture: '/bots/grin-zoom.png',
	points: 0,
	slug: 'lykuguest',
	staff: true,
} as const satisfies User;
