import { User } from '@lyku/json-models';
export const hardTtfBot = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 13n,
	joined: new Date('2024-01-20T05:36:36.888Z'),
	lastLogin: new Date('2024-01-20T05:36:36.888Z'),
	live: false,
	postCount: 0n,
	username: 'lykuHardTtfBot',
	profilePicture: '/bots/anger-zoom.png',
	points: 0,
	slug: 'lykuhardttfbot',
	staff: true,
} as const satisfies User;
