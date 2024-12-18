import { User } from '@lyku/json-models';
export const noviceTtfBot = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 10n,
	joined: new Date('2024-01-20T05:36:36.888Z'),
	lastLogin: new Date('2024-01-20T05:36:36.888Z'),
	live: false,
	postCount: 0n,
	username: 'lykuNoviceTtfBot',
	profilePicture: '/bots/cute-zoom.png',
	points: 0,
	slug: 'lykunovicettfbot',
	staff: true,
} as const satisfies User;
