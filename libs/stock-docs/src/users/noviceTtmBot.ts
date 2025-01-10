import { User } from '@lyku/json-models';
export const noviceTtmBot = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 20n,
	joined: new Date('2024-01-20T05:36:36.888Z'),
	lastLogin: new Date('2024-01-20T05:36:36.888Z'),
	live: false,
	postCount: 0n,
	username: 'lykuNoviceTtmBot',
	profilePicture: '/bots/cute-zoom.png',
	points: 0,
	slug: 'lykunovicettmbot',
	staff: true,
	groupLimit: 0
} as const satisfies User;
