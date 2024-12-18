import { User } from '@lyku/json-models';
export const mediumTtfBot = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 12n,
	joined: new Date('2024-01-20T05:36:36.888Z'),
	lastLogin: new Date('2024-01-20T05:36:36.888Z'),
	live: false,
	postCount: 0n,
	username: 'lykuMediumTtfBot',
	profilePicture: '/bots/nonplussed-zoom.png',
	points: 0,
	slug: 'lykumediumttfbot',
	staff: true,
} as const satisfies User;
